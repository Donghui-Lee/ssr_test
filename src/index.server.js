import React from "react";
import ReactDOMServer from "react-dom/server";
import express from "express";
import { StaticRouter } from "react-router-dom";
import App from "./App";
import path from "path";
import fs from "fs";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import rootReducer, { rootSaga } from "./modules";
import PreloadContext, { Preload } from "./lib/PreloadContext";
import createSagaMiddleware from "redux-saga";
import {END} from 'redux-saga';

// asset-mainfest.json 에서 파일 경로들을 조회
const manifest = JSON.parse(
  fs.readFileSync(path.resolve("./build/asset-manifest.json"), "utf8")
);

// <script src="/static/js/2.5dd7ef7f.chunk.js"></script> 추출
const chunks = Object.keys(manifest.files)
  .filter(key => /chunk\.js$/.exec(key))
  .map(key => `<script src="${manifest.files[key]}"></script>`)
  .join("");

function createPage(root, stateScript) {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8" />
        <link rel="shortcut icon" href="/favicon.io" />
        <meta name="viewport"
              content="width=device-width,initial-scale=1,shrink-to-fit=no" />
        <meta name="theme-color" content="#000000" />
        <title>React App</title>
        <link href="${manifest.files["main.css"]}" rel="stylesheet" />
    </head>
    <body>
        <noscript>You need to enable Javascript to run this app.</noscript>
        <div id="root">
            ${root}
        </div>
        ${stateScript}
        <script src="${manifest.files["runtime-main.js"]}"></script>
        ${chunks}
        <script src="${manifest.files["main.js"]}"></script>
    </body>
    </html>
    `;
}

const app = express();

// 서버 사이드 렌더링을 처리할 핸드러 함수
const serverRender = async (req, res, next) => {
  // 이 함수는 404가 떠야 하는 상황에서 404를 띄우지 않고 서버 사이드 렌더링을 지원

  const context = {};
  const sagaMiddleware = createSagaMiddleware();

  const store = createStore(
    rootReducer,
    applyMiddleware(thunk, sagaMiddleware)
  );

  const sagaPromise = sagaMiddleware.run(rootSaga).toPromise();

  const preloadContext = {
    done: false,
    promises: []
  };

  const jsx = (
    <PreloadContext.Provider value={preloadContext}>
      <Provider store={store}>
        <StaticRouter location={req.url} context={context}>
          <App />
        </StaticRouter>
      </Provider>
    </PreloadContext.Provider>
  );

  // renderToStaticMarkup 으로 한번 렌더링
  ReactDOMServer.renderToStaticMarkup(jsx);
  // redux-saga 의 END 액션을 발생시키면 액션을 모니터링하는 사가들이 모두 종료
  store.dispatch(END);

  try {
      // 기존에 진행중이던 사가들이 모두 끝날 때까지 기다림
      await sagaPromise;
      // 모든 프로미스를 기다림
      await Promise.all(preloadContext.promises);
  } catch (e) {
      return res.status(500);
  }

  preloadContext.done = true;
  const root = ReactDOMServer.renderToString(jsx); // 렌더링

  // JSON 을 문자열로 변환하고 악성 스크립트가 실행되는 것을 방지하기 위해 <을 치환 처리
  // https://redux.js.org/recipes/server-rendering#security-considerations
  const stateString = JSON.stringify(store.getState()).replace(/</g, "\\u003c");
  // 리덕스 초기 상태를 스크립트로 주입
  const stateScript = `<script>__PRELOADED_STATE__ = ${stateString}</script>`;

  res.send(createPage(root, stateScript)); // 클라이언트에게 결과물을 응답
};

const serve = express.static(path.resolve("./build"), {
  index: false // "/" 경로에서 index.html 을 보여 주지 않도록 설정
});

// 순서가 중요
app.use(serve); // serverRender 전에 위치
app.use(serverRender);

// 5000 포트로 서버를 가동
app.listen(5000, () => {
  console.log("Running on http://localhost:5000");
});
