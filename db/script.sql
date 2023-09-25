USE geracaoeleita;

CREATE TABLE formulario (
    cod_formulario INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255),
    valor DECIMAL(10, 2),
    data_inicio DATE,
    data_fim DATE
);

CREATE TABLE inscricao (
    cod_inscricao INT AUTO_INCREMENT PRIMARY KEY,
    situacao_pagamento VARCHAR(50),
    cod_formulario INT,
    link_pagamento VARCHAR(255),
    id_transacao VARCHAR(255),
    FOREIGN KEY (cod_formulario) REFERENCES formulario(cod_formulario)
);

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
    FOREIGN KEY (cod_inscricao) REFERENCES inscricao(cod_inscricao)
);

CREATE TABLE `usuario` (
  `login` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `senha` varchar(100) DEFAULT NULL,
  `nome` varchar(100) DEFAULT NULL
) 