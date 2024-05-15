import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styled from "styled-components";
import Mypage from "./Mypage";

const MainBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export default function Main() {
  return <Mypage />;
}
