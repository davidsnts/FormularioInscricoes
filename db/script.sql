USE geracaoeleita;

CREATE TABLE formulario (
    cod_formulario INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255),
    valor DECIMAL(10, 2),
    data_inicio DATE,
    data_fim DATE
);

CREATE TABLE `inscricao` (
  `cod_inscricao` int(11) NOT NULL AUTO_INCREMENT,
  `situacao_pagamento` varchar(50) DEFAULT NULL,
  `cod_formulario` int(11) DEFAULT NULL,
  `link_pagamento` varchar(255) DEFAULT NULL,
  `id_transacao` varchar(255) DEFAULT NULL,
  `desconto` decimal(4,2) DEFAULT 0.00,
  `total_pago` decimal(4,2) DEFAULT 0.00,
  PRIMARY KEY (`cod_inscricao`),
  KEY `cod_formulario` (`cod_formulario`),
  CONSTRAINT `inscricao_ibfk_1` FOREIGN KEY (`cod_formulario`) REFERENCES `formulario` (`cod_formulario`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


CREATE TABLE inscrito (
    cod_inscrito INT AUTO_INCREMENT PRIMARY KEY,
    cod_inscricao INT,
    nome VARCHAR(255),
    email VARCHAR(255),
    telefone VARCHAR(15),
    dataNascimento DATE,
    telefoneResponsavel VARCHAR(15),
    nomeResponsavel VARCHAR(255),
    bairroCongregacao VARCHAR(255),
    telefoneEmergencia VARCHAR(15),
    rua VARCHAR(255),
    numero VARCHAR(10),
    bairro VARCHAR(255),
    cidade VARCHAR(255),
    estado VARCHAR(2),
    lider VARCHAR(100),
    genero CHAR(1),
    complemento varchar(100),
    FOREIGN KEY (cod_inscricao) REFERENCES inscricao(cod_inscricao)
);

CREATE TABLE `usuario` (
  `login` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `senha` varchar(100) DEFAULT NULL,
  `nome` varchar(100) DEFAULT NULL
)

CREATE TABLE `cupom` (
  `cod_cupom` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(100) NOT NULL,
  `quantidade` int(11) NOT NULL,
  `data_cadastro` date DEFAULT curdate(),
  `data_fim` date NOT NULL,
  `situacao` varchar(45) DEFAULT 'Ativo',
  `desconto` decimal(4,2) NOT NULL,
  PRIMARY KEY (`cod_cupom`),
  UNIQUE KEY `codigo_UNIQUE` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
