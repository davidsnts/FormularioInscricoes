const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/inscrever', (req, res) => {   
  res.render('formularios/formulario1');
});


module.exports = router;
