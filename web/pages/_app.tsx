import "../styles/globals.css";
import type { AppProps } from "next/app";

// ✅ If you are using NextAuth (Google Sign-In)
// uncomment the next 2 lines and wrap the <Component /> inside <SessionProvider>
// import { SessionProvider } from "next-auth/react";

export default function App({ Component, pageProps }: AppProps) {
  // return (
  //   <SessionProvider session={pageProps.session}>
  //     <Component {...pageProps} />
  //   </SessionProvider>
  // );

  // 👇 Use this version if you're not actively using NextAuth yet
  return <Component {...pageProps} />;
}
