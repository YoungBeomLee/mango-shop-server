const express = require("express");
const cors = require("cors");
const models = require("./models");
const multer = require("multer");
const app = express();
const port = process.env.PORT || 8080;

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.get('/banners',(req,res)=>{
	models.Banner.findAll({
		limit: 2,	//파일 2개까지 찾음 , 데이터베이스에서는 Banners로 s가 자동으로 붙음.
	  })
		.then((result) => {
		  res.send({
			banners: result, //통신성공시 banner에 result 할당
		  });
		})
		.catch((error) => {
		  console.error(error);
		  res.status(500).send("에러가 발생했습니다");
		});
})
app.get("/products", (req, res) => {
  models.Product.findAll({
    order: [["createdAt", "DESC"]],
    attributes: ["id", "name", "price", "seller", "imageUrl", "createdAt","soldout"],
  })
    .then((result) => {
      console.log("product 조회결과:", result);
      res.send({
        product: result,
      });
    })
    .catch((err) => {
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
    .then((result) => {
      console.log("조회결과:", result);
      res.send({
        product: result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.send("상품조회시 에러가 발생했습니다");
    });
});

app.post("/image", upload.single("image"), (req, res) => {
  const file = req.file;
  res.send({
    imageUrl: file.path,
  });
});

//상품생성데이터를  데이터베이스 추가
app.post("/products", (req, res) => {
  const body = req.body;
  const { name, description, price, seller, imageUrl } = body;
  if (!name || !description || !price || !seller) {
    res.send("모든 필드를 입력해주세요");
  }
  models.Product.create({
    name,
    description,
    imageUrl,
    price,
    seller,
  })
    .then((result) => {
      console.log("상품생성결과:", result);
      res.send({ result });
    })
    .catch((error) => {
      console.error(error);
      //res.send("상품업로드에 문제가 발생했습니다");
    });
});
//api 요청 -> 전달 -> 응답
app.post("/purchase/:id", (req, res) => {
  const { id } = req.params;
  models.Product.update(
    {
      soldout: 1,
    },
    {
      where: {
        id,
      },
    }
  )
    .then((result) => {
      res.send({
        result: true,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("에러가 발생했습니다.");
    });
});

app.post("/login", (req, res) => {
  res.send("로그인이 완료되었습니다");
});

//app 실행
app.listen(port, () => {
  console.log("👩망고샵의 쇼핑몰 서버가 돌아가고 있습니다.🐶멍");
  //sequelize.sync() DB에 필요한 테이블 생성
  models.sequelize
    .sync()
    .then(() => {
      console.log("😁DB연결성공");
    })
    .catch((err) => {
      console.error(err);
      console.log("😨DB연결에러");
      process.exit();
    });
});
