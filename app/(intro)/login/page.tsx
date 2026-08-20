import { LoginExperience } from './LoginExperience';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    returnTo?: string;
    intent?: string;
    mode?: string;
    error?: string;
    error_description?: string;
  }>;
}) {
  const params = await searchParams;
  const returnTo =
    params.returnTo?.startsWith('/') && !params.returnTo.startsWith('//')
      ? params.returnTo
      : '/home';

  return (
    <LoginExperience
      returnTo={returnTo}
      intent={params.intent === 'claim' ? 'claim' : undefined}
      initialMode={params.mode === 'signup' ? 'signup' : 'login'}
      initialError={
        params.error === 'invalid_credentials'
          ? '이메일 또는 비밀번호가 일치하지 않습니다.'
          : params.error
            ? params.error_description?.slice(0, 180) || '소셜 로그인을 완료하지 못했어요. 다시 시도해 주세요.'
          : ''
      }
    />
  );
}
