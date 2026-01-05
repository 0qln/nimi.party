import { redirect } from '@sveltejs/kit';

export function load() {
  throw redirect(307, '/anniversary/1');
}
