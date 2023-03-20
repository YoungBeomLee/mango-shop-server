//import React , {} from "react";

const express = require("express");
const cors = require("cors");
const app = express();
const port = 8080;
const models = require("./models");

app.use(express.json()); //json 형식의 데이터를 처리할 수 있게 설정하는 코드
app.use(cors()); //브라우저의 CORS 이슈를 막기 위해 사용하는 코드

app.get("/products", (req, res) => {
  models.Product.findAll({
    //limit:2
    
    order:[['createdAt','DESC']],//정렬추가 : createdAt 컬럼 내림차순(큰수->작은수=> 최신등록상품)
    attributes: ["id", "name", "price", "seller", "imageUrl", "createdAt"],

})
    .then(function (result) {
      console.log("product:", result);
      res.send({ product: result });
    })
    .catch(function (err) {
      console.error(err);
      res.send("에러발생");
    });
});

app.get("/products/:id", (req, res) => {
  const params = req.params;
  const { id } = params;
  models.Product.findOne({
    where: { id: id },
  })
    .then(function (result) {
      console.log("product:", result);
      res.send({
      product: result,
      });
    })
    .catch(function (error) {
      console.error();
      res.send("상품조회시 에러가 발생했습니다.");
    });
});
//상품생성데이터를 데이터베이스에 추가
app.post("/products", (req, res) => {
  const body = req.body;
  //1.상수 body에 전달받은 값을 구조분해할당
  const { name, description, price, seller } = body;
  if (!name || !description || !price || !seller) {
    res.send("모든 필드를 입력해주세요");
  }
  //레코드 생성
  models.Product.create({
    name,
    description,
    price,
    seller,
  })
    .then(function (result) {
      console.log("상품생성결과:", result);
      res.send({ result });
    })
    .catch(function (error) {
      console.error(error);
      //res.send('상품 업로드에 문제가 발생했습니다.')
    });
  console.log(body);
});

app.post("/login", (req, res) => {
  res.send("로그인해주세요.");
});

//세팅한 app을 실행시킨다.
app.listen(port, () => {
  console.log("망고샵의 쇼핑몰 서버가 돌아가고 있습니다.");
  models.sequelize
    .sync()
    .then(function () {
      console.log("😁db연결 성공");
    })
    .catch(function (err) {
      console.log(err);
      console.log("db연결 x");
      process.exit();
    });
});
