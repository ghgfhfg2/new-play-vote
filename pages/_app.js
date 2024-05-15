import React, { useState, useEffect } from "react";
import "antd/dist/antd.css";
import "../styles/App.css";
import wrapper from "../src/redux/store/configureStore";
import { useDispatch, useSelector } from "react-redux";
import {
  setUser,
  clearUser,
  nickChange,
} from "../src/redux/actions/user_action";
import { db, auth } from "../src/firebase";
import { ref, onValue, off, get } from "firebase/database";
import { useRouter } from "next/router";
import Login from "./login";
import Loading from "../src/component/Loading";
import Footer from "../src/component/Footer";
import AppLayout from "../src/component/AppLayout";
import GoogleAd from "../src/component/GoogleAd";

function App({ Component, pageProps }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const path = router.pathname;
  const [authCheck, setAuthCheck] = useState(false);
  const [isLoading, setisLoading] = useState(true);

  auth.onAuthStateChanged((user) => {
    if (user) {
      const userRef = ref(db, `user/${user.uid}`);
      get(userRef).then((data) => {
        let userData = {
          ...user,
        };
        if (data.val()?.rule) {
          userData = { ...userData, rule: data.val().rule };
        }
        if (data.val()?.nick) {
          userData = {
            ...userData,
            nick: data.val().nick,
            displayName: data.val().nick,
          };
        }
        dispatch(setUser(userData));
      });
      setAuthCheck(true);
    } else {
      dispatch(clearUser());
      setAuthCheck(false);
    }
    setisLoading(false);
  });

  return (
    <>
      <div id="content">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {authCheck ? (
              <>
                <GoogleAd />
                <Component {...pageProps} />
                {!path.includes("/view") && (
                  <>
                    <div className="empty_box"></div>
                    <Footer />
                  </>
                )}
              </>
            ) : (
              <Login />
            )}
          </>
        )}
      </div>
    </>
  );
}

export default wrapper.withRedux(App);
