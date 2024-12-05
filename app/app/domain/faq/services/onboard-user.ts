import { OnboardingStep, SocialLink } from '@prisma/client';
import {
  NodeOnDiskFile,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import assert from 'http-assert';
import z from 'zod';
import { BlobStorage } from '~/infrastructure/storage';
import { uploadHandler } from '~/utils/file-upload-handler';
import { ExternalLinkEntity } from '../entities/external-link';
import { UserProfileEntity } from '../entities/user-profile';
import { AssetRepository } from '../repositories/asset-repository';
import { UserProfileRepository } from '../repositories/user-profile-repository';
import { UserRepository } from '../repositories/user-repository';
import { WalletRepository } from '../repositories/wallet-repository';

export const onboardUserSchema = z.object({
  onboarding: z.nativeEnum(OnboardingStep),
  username: z.string().min(1).nullish(), // this is required but the onboarding flow handles this itself
  avatar: z.instanceof(NodeOnDiskFile).nullish(),
  about: z.string().nullish(),
  externalLinks: z
    .array(
      z.object({
        url: z.string().min(1).nullish(),
        type: z.nativeEnum(SocialLink).nullish(),
      })
    )
    .nullish(),
  publicKey: z.string().min(1).nullish(),
});

export type OnboardUserFormErrors = z.inferFlattenedErrors<
  typeof onboardUserSchema
>['fieldErrors'];

export class OnboardUser {
  private userId: number;
  private request: Request;

  constructor(userId: number, request: Request) {
    this.userId = userId;
    this.request = request;
  }

  async validateParams() {
    const formData = await unstable_parseMultipartFormData(
      this.request,
      uploadHandler
    );
    const data = await onboardUserSchema.parseAsync({
      onboarding: formData.get('onboarding'),
      about: formData.get('about'),
      username: formData.get('username'),
      avatar: formData?.get('avatar'),
      externalLinks: JSON.parse(String(formData.get('socialLinks'))), // simpler; couldn't get array to submit 😅
      publicKey: formData?.get('publicKey'),
    });

    return data;
  }

  async updateAvatar(
    userProfile: UserProfileEntity,
    avatar?: NodeOnDiskFile | null
  ) {
    if (!avatar) {
      return;
    }

    const filename = `${this.userId}/${avatar.name}`;
    const result = await new BlobStorage(filename, avatar).upload();
    const entity = await AssetRepository.upsertByUserProfileId(
      userProfile.id!,
      {
        url: result,
        userProfileId: userProfile.id!,
      }
    );
    return entity;
  }

  async updateWallet(userProfile: UserProfileEntity, key?: string | null) {
    if (!key) {
      return;
    }

    return await WalletRepository.upsertByUserProfileId(userProfile.id!, {
      key,
      userProfileId: userProfile.id!,
    });
  }

  getExternalLinks(data?: z.infer<typeof onboardUserSchema>['externalLinks']) {
    if (!data) {
      return;
    }

    const filteredResults = data?.filter((c) => !!c.url && !!c.type); // valid urls only
    if (filteredResults?.length) {
      return filteredResults.map(
        (c) => new ExternalLinkEntity({ type: c.type!, url: c.url! })
      );
    }

    return [];
  }

  async call() {
    const user = await UserRepository.findByUserId(this.userId);
    assert(user, 404, 'User does not exist');

    const data = await this.validateParams();
    const [avatar, wallet] = await Promise.all([
      this.updateAvatar(user.UserProfile, data.avatar),
      this.updateWallet(user.UserProfile, data.publicKey),
    ]);

    // Set the current step as the current onboarding
    user.UserProfile.onboarding = data.onboarding;

    const updatedUser = await UserProfileRepository.onboardUserByUserId(
      this.userId,
      {
        onboarding: user.UserProfile.getNextOnboardingStep(),
        username: data.username ?? undefined,
        Avatar: avatar,
        about: data?.about,
        ExternalLinks: this.getExternalLinks(data?.externalLinks),
        Wallet: wallet,
      }
    );

    updatedUser!.Avatar = avatar!;
    user.UserProfile = updatedUser!;
    user.UserProfile.Wallet = wallet!;

    return user;
  }
}
