with open('content/KSSR_Syllabus/Primary6/English/Revision1/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

print("File size:", len(content))
print("Number of script tags:", content.count('<script'))
print("Number of button tags:", content.count('<button'))
print("Contains START!:", "START!" in content)
print("Contains startGame():", "startGame()" in content)
