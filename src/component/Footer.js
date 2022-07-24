import React from 'react';
import Link from "next/link";
import {useRouter} from 'next/router';
import * as aiIcon from "react-icons/ai"
import { RiUser3Line,RiUser3Fill,RiSearchFill,RiSearchLine } from "react-icons/ri"
import { IoIosListBox,IoIosList } from "react-icons/io"
import {RiFileAddFill,RiFileAddLine} from "react-icons/ri"

function Footer() {
  const router = useRouter()
  const path = router.pathname;
  return (
    <>
      <footer className='footer'>
        <Link href="/">
          <a>
          {path === '/' ? <IoIosListBox /> : <IoIosList />}
          <span>목록</span>
          </a>
        </Link>
        <Link href="/search">
          <a>
          {path === '/search' ? <RiSearchFill /> : <RiSearchLine />}
          <span>코드검색</span>
          </a>
        </Link>
        <Link href="/regist">
          <a>
          {path === '/regist' ? <RiFileAddFill /> : <RiFileAddLine />}
          <span>등록</span>
          </a>
        </Link>
        <Link href="/mypage">
          <a>
          {path === '/mypage' ? <RiUser3Fill /> : <RiUser3Line />}
          <span>내 정보</span>
          </a>
        </Link>
      </footer>
    </>
 )
}

export default Footer