
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const usersRoutes = require('./routes/users');
const coletasRoutes = require('./routes/coletas');
const cepRoutes = require('./routes/cep');
const dashboardRoutes = require('./routes/dashboard');
const authRouter = require('./routes/auth');


app.use('/usuarios', usersRoutes);
app.use('/coletas', coletasRoutes);
app.use('/login', authRouter);
app.use('/', cepRoutes); // /cep/:cep
app.use('/', dashboardRoutes); // /dashboard

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
