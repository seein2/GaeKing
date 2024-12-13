const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express'); // swagger
const YAML = require('yamljs');
const swaggerDoc = YAML.load('./docs/swagger.yaml');

dotenv.config();
const pageRouter = require('./routes/page');

const app = express();
app.set('port', process.env.PORT || 3000);


app.use(morgan('dev')); //combined
app.use(express.json());
app.use(cors()); // 다른 도메인에서 요청 허용


app.use('/', pageRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));



app.listen(app.get('port'), () => {
    console.log('서버 실행');
});