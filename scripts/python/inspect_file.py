with open('arquivos/teste_de_para_dre.csv', 'rb') as f:
    content = f.read(300)
    print('Primeiros 300 bytes:')
    print(content)
    print(f'\nSemicolon count: {content.count(b";")}')
    print(f'Comma count: {content.count(b",")}')