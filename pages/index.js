import { useEffect } from "react";
import { useRouter } from "next/router";

import Mypage from "../src/component/Mypage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/mypage");
  }, []);

  return (
    <>
      <Mypage />
    </>
  );
}
