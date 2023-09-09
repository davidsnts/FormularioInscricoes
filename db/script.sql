use geracaoeleita;
/*geracaoeleita database*/
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
    FOREIGN KEY (cod_formulario) REFERENCES Formulario(cod_formulario)
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
    lider varchar(100),
    FOREIGN KEY (cod_inscricao) REFERENCES Inscricao(cod_inscricao)
);