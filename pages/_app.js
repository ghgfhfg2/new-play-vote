import React, { useState, useEffect } from "react";
import Link from "next/link";
import Top from "@component/Top";
import "antd/dist/antd.css";
import "styles/App.css";
import wrapper from "@redux/store/configureStore";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser, nickChange } from "@redux/actions/user_action";
import { db, auth } from "src/firebase";
import { ref, onValue, off, get } from "firebase/database";
import {useRouter} from 'next/router';
import Login from "./login";
import Loading from "../src/component/Loading";
import Footer from "@component/Footer";
import AppLayout from "@component/AppLayout";
import Join from "./join";


function App({ Component, pageProps }) {
  const dispatch = useDispatch();
  const router = useRouter();  
  const path = router.pathname;
  const [authCheck, setAuthCheck] = useState(false);
  const [isLoading, setisLoading] = useState(true);

  auth.onAuthStateChanged((user) => {
    if (user) {
      const userRef = ref(db, `user/${user.uid}/nick`);
      get(userRef)
      .then(data=>{
        if(data.val()) {
          let nickUser = {
            ...user,
            displayName: data.val()
          }
          dispatch(setUser(nickUser));
        }else{
          dispatch(setUser(user));
        }
      })
      setAuthCheck(true);
      
    } else {
      dispatch(clearUser());
      setAuthCheck(false)
    }
    setisLoading(false)
  })


  
  

  return (
    <>
      
      <div id="content">  
        {isLoading && 
          <Loading />
        }
        {authCheck ? (
            <>
              <Component {...pageProps} />
            {!path.includes('/view') && 
              <>
              <div className="empty_box"></div>
              <Footer />
              </>
            }
            </>
          ) : 
          path === '/join' ? (
            <Join />
          ) : (
            <Login />
          )
        }
      </div>      
    </>
  );
}

export default wrapper.withRedux(App);
