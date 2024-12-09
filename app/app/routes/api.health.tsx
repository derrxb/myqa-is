import type { LoaderFunctionArgs } from '@remix-run/node';
import { typedjson } from 'remix-typedjson';

export async function loader(args: LoaderFunctionArgs) {
  return typedjson({ alive: true });
}