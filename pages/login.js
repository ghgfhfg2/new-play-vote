import React, { useState } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { db, provider } from "../src/firebase";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setUser } from "../src/redux/actions/user_action";
import { AiOutlineGoogle } from "react-icons/ai";
import { MdAlternateEmail } from "react-icons/md";
import Link from "next/link";
import { Button, Form, Input, message, Modal } from "antd";
import JoinModal from "../src/component/join/JoinModal";
import LoginModal from "../src/component/login/LoginModal";

export default function Login() {
  const auth = getAuth();
  let dispatch = useDispatch();
  const router = useRouter();
  const googleHandler = async () => {
    provider.setCustomParameters({ prompt: "select_account" });
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result);
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        dispatch(setUser(user));
        router.push("/");
        // redux action? --> dispatch({ type: SET_USER, user });
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  };

  const googleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("logged out");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const showLoginModal = () => {
    setIsLoginModalVisible(true);
  };
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleCancel = () => {
    setIsLoginModalVisible(false);
    setIsModalVisible(false);
  };

  const onFinish = (values) => {
    if (values.password !== values.passwordConfirm) {
      message.error("비밀번호 확인이 일치하지 않습니다");
      return;
    } else {
      createUserWithEmailAndPassword(auth, values.email, values.password)
        .then((userCredential) => {
          const user = userCredential.user;
          dispatch(setUser(user));
          set(ref(db, `user/${user.uid}`), {
            nick: values.nick,
          });
          router.push("/");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode, errorMessage);
          // ..
        });
    }
  };

  const onLoginSubmit = (values) => {
    signInWithEmailAndPassword(auth, values.email, values.password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  };

  return (
    <>
      <div className="login_box">
        <button type="button" onClick={googleHandler}>
          <AiOutlineGoogle />
          <span>구글로 로그인</span>
        </button>
        <button type="button" onClick={showLoginModal}>
          <MdAlternateEmail />
          <span>이메일로 로그인</span>
        </button>
        <button type="button" onClick={showModal}>
          <MdAlternateEmail />
          <span>이메일로 회원가입</span>
        </button>
      </div>
      <Modal
        centered
        title="로그인"
        visible={isLoginModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <LoginModal onLoginSubmit={onLoginSubmit} />
      </Modal>
      <Modal
        centered
        title="회원가입"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <JoinModal onFinish={onFinish} />
      </Modal>
    </>
  );
}
