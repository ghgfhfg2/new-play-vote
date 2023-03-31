import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="ko">
        <Head>
          <title>play vote | 투표를 합시다.</title>
          <meta
            name="keywords"
            content="vote,투표,점심메뉴,선택장애,비밀투표,공개투표"
          />
          <meta
            name="description"
            content="결정이 필요한 순간 투표를 해보세요!"
          />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          <meta httpEquiv="Pragma" content="no-cache" />
          <meta httpEquiv="Expires" content="0" />
          <meta httpEquiv="Cache-Control" content="no-cache" />
          <base href="/" />
          <meta property="og:site_name" content="play vote | 투표를 합시다." />
          <meta property="og:title" content="play vote | 투표를 합시다." />
          <meta property="og:url" content="https://vote.sooyadev.com/" />
          <meta property="og:type" content="website" />
          <meta name="theme-color" content="#3182CE" />
          <link rel="manifest" href="/manifest.json" />
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6788425959877259"
            crossOrigin="anonymous"
          ></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
