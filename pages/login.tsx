import React from "react";

import { useRouter } from "next/router";

import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

function login() {
	const session = useSession();
	const supabase = useSupabaseClient();
	const router = useRouter();

	if (session) router.replace("/"); // redirect to home if logged in

	return (
		<Auth
			supabaseClient={supabase}
			appearance={{ theme: ThemeSupa }}
			theme="dark"
		/>
	);
}

export default login;