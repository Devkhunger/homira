"use client";
import { startTransition, useActionState, useEffect, useState } from "react";

/**
 * Like useActionState, but submits via onSubmit so React does NOT clear the form
 * when the server returns a validation error (the user keeps what they typed).
 * `ready` is false until the page's JavaScript has loaded; disable submit buttons
 * until then so a fast tap never sends the form the wrong way.
 */
export function useFormAction<S>(action: (state: S, form: FormData) => Promise<S>, initial: S) {
  const [state, dispatch, pending] = useActionState<S, FormData>(
    action as (state: Awaited<S>, form: FormData) => Promise<S>,
    initial as Awaited<S>,
  );
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => dispatch(data));
  };
  return [state, onSubmit, pending || !ready] as const;
}
