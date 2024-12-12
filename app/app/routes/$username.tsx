import { LoaderFunctionArgs } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { redirect, typedjson, useTypedLoaderData } from 'remix-typedjson';
import { z } from 'zod';
import { authenticator } from '~/auth.server';
import { UserRepository } from '~/domain/faq/repositories/user-repository';
import { getCryptoPrice, SupportedCoins } from '~/infrastructure/crypto';
import prisma from '~/infrastructure/database/index.server';
import { Avatar } from '~/ui/atoms/avatar';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '~/ui/atoms/pagination';
import { MainLayout } from '~/ui/layouts/main';
import { NewQuestionButton } from '~/ui/molecules/new-question-button';
import { LoginRegisterDialog } from '~/ui/organisms/auth/login-register-dialog';
import { QuestionsList } from '~/ui/organisms/questions/questions-list';
import { ExternalLinkList } from '~/ui/organisms/social/external-links-list';
import { Wallet } from '~/ui/organisms/wallet';

const paginationSchema = z.object({
  page: z.coerce.number().min(0),
  size: z.coerce.number().max(1000),
});

export const loader = async (args: LoaderFunctionArgs) => {
  const session = await authenticator.isAuthenticated(args.request);
  const username = args.params.username;
  const url = new URL(args.request.url);
  const searchParams = url.searchParams;
  const paginationResult = await paginationSchema.safeParseAsync({
    page: searchParams.get('page') ?? 0,
    size: searchParams.get('size') ?? 5,
  });

  // Redirect to the first page
  console.log(paginationResult.error);
  if (paginationResult.error) {
    return redirect(url.pathname);
  }

  const user = await UserRepository.findByUsername(username!, {
    questions: {
      page: paginationResult.data.page,
      size: paginationResult.data.size,
    },
  });

  if (user?.username !== username?.toLowerCase()) {
    return redirect(`/${user?.username?.toLowerCase()}`);
  }

  const [bonkPrice, totalAvailableQuestions] = await Promise.all([
    getCryptoPrice(SupportedCoins.BONKUSDT, process.env.BINANCE_API_KEY),
    prisma.qA.count({ where: { userId: user?.id } }),
  ]);

  return typedjson({
    bonkPrice,
    isCreator: user?.id === session?.id,
    user: user?.json(),
    totalAvailableQuestions,
    pagination: {
      ...paginationResult.data,
      pageCount: Math.ceil(
        totalAvailableQuestions / paginationResult.data.size
      ),
    },
  });
};

const UserProfile = () => {
  const data = useTypedLoaderData<typeof loader>();

  return (
    <MainLayout disableSiteNav className="items-center space-y-4">
      <div className="max-w-4xl w-full 2xl:w-[1080px] border-slate-300">
        <div className="flex flex-col p-4 space-y-8">
          <div className="flex flex-row justify-between items-center">
            <Wallet />
            <LoginRegisterDialog
              username={data?.user?.username?.toLowerCase()!}
            />
          </div>

          <div className="mx-auto text-center flex flex-col">
            <Avatar
              src={data.user?.UserProfile?.Avatar?.url!}
              fallback={data.user?.username?.[0]!}
              className="h-40 w-40 mx-auto mb-4"
            />
            <h1 className="font-bold text-xl">{data?.user?.username}</h1>
            <span className="text-gray-500 font-lg">
              {data?.user?.UserProfile?.about ?? 'No description available'}
            </span>

            <ExternalLinkList links={data?.user?.UserProfile?.ExternalLinks} />
          </div>

          <NewQuestionButton isCreator={data?.isCreator} />
        </div>
      </div>

      <div className="max-w-4xl w-full 2xl:w-[1080px]">
        <QuestionsList
          questions={data?.user?.UserProfile?.QAs}
          cryptoPrice={data?.bonkPrice}
          isCreator={data?.isCreator}
        />

        <Pagination className="py-8">
          <PaginationContent className="flex flex-row items-center space-x-4">
            {data?.pagination?.page > 0 ? (
              <PaginationItem>
                <PaginationPrevious
                  href={`/${data?.user?.username}?page=${data?.pagination?.page - 1}`}
                />
              </PaginationItem>
            ) : (
              <PaginationItem className="px-2 cursor-not-allowed text-sm flex flex-row items-center space-x-1">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </PaginationItem>
            )}

            <PaginationItem>{data?.pagination?.page + 1}</PaginationItem>

            {data?.pagination?.page + 1 < data?.pagination.pageCount ? (
              <PaginationItem>
                <PaginationNext
                  href={`/${data?.user?.username}?page=${data?.pagination?.page + 1}`}
                />
              </PaginationItem>
            ) : (
              <PaginationItem className="px-2 cursor-not-allowed text-sm flex flex-row items-center space-x-1">
                Next
                <ChevronRight className="h-4 w-4" />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
