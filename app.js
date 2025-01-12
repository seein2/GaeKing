const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express'); // swagger
const YAML = require('yamljs');
const swaggerDoc = YAML.load('./docs/swagger.yaml');
require('./models'); // db연결

dotenv.config();
const authRouter = require('./routes/authRoutes');
const dogRouter = require('./routes/dogRoutes');
const scheduleRouter = require('./routes/scheduleRoutes');
const widgetRouter = require('./routes/widgetRoutes');

const app = express();
app.set('port', process.env.PORT || 3000);


app.use(morgan('dev')); //combined
app.use(express.json());
app.use(cors()); // 다른 도메인에서 요청 허용
app.use('/uploads', express.static('uploads')); // 정적 파일 제공

app.use('/auth', authRouter);
app.use('/dog', dogRouter);
app.use('/schedule', scheduleRouter);
app.use('/widget', widgetRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.get('/', (req, res) => {
    res.send('GaeKing 서버');
});

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url}라우터가 없음.`);
    error.status = 404;
    next(error);
})

app.listen(app.get('port'), '0.0.0.0', () => {
    console.log(`${app.get('port')}번 포트에서 서버 실행 중`);
});