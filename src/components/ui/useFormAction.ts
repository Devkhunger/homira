"use client";
import { startTransition, useActionState } from "react";

/**
 * Like useActionState, but submits via onSubmit so React does NOT clear the form
 * when the server returns a validation error (the user keeps what they typed).
 */
export function useFormAction<S>(action: (state: S, form: FormData) => Promise<S>, initial: S) {
  const [state, dispatch, pending] = useActionState<S, FormData>(
    action as (state: Awaited<S>, form: FormData) => Promise<S>,
    initial as Awaited<S>,
  );
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => dispatch(data));
  };
  return [state, onSubmit, pending] as const;
}
