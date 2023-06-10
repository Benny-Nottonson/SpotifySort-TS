import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Button from "../components/button";
import { useSession, signIn, signOut } from "next-auth/react";
import { MySession } from "@/types/types";
import { faSpotify } from "@fortawesome/free-brands-svg-icons";

interface UseSession {
	data: MySession | null;
	status: any;
}

export default function Home() {
	const { data: session }: UseSession = useSession();
	const router = useRouter();

	useEffect(() => {
		if (session?.error === "RefreshAccessTokenError") {
			signIn("spotify", { callbackUrl: process.env.REDIRECT_URI });
		} else if (session) {
			router.push({
				pathname: "/authenticated",
				query: { session: JSON.stringify(session) },
			});
		}
	}, [session, router]);

	const handleSignIn = () => {
		signIn("spotify", { callbackUrl: process.env.REDIRECT_URI });
	};

	const handleSignOut = () => {
		signOut();
	};

	return (
		<main className="flex flex-col items-center justify-center min-h-screen py-2 bg-white overflow-x-hidden">
			<Head>
				<title>Spotify Next-Auth Token Rotation</title>
			</Head>
			{!session && (
				<div>
					<p>Not signed in</p>
					<Button text="Sign in" onEvent={handleSignIn} icon={faSpotify} />
				</div>
			)}
		</main>
	);
}
