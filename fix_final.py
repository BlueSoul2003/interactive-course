import re
import json

familyData = [
{ "zh": "\u7237\u7237/\u5916\u516c", "en": "Grandfather", "uchi": "\u305d\u3075", "soto": "\u304a\u3058\u3044\u3055\u3093" },
{ "zh": "\u5976\u5976/\u5916\u5a46", "en": "Grandmother", "uchi": "\u305d\u307c", "soto": "\u304a\u3070\u3042\u3055\u3093" },
{ "zh": "\u7238\u7238", "en": "Father", "uchi": "\u3061\u3061", "soto": "\u304a\u3068\u3046\u3055\u3093" },
{ "zh": "\u5988\u5988", "en": "Mother", "uchi": "\u306f\u306f", "soto": "\u304a\u304b\u3042\u3055\u3093" },
{ "zh": "\u54e5\u54e5", "en": "Older Brother", "uchi": "\u3042\u306b", "soto": "\u304a\u306b\u3044\u3055\u3093" },
{ "zh": "\u59d0\u59d0", "en": "Older Sister", "uchi": "\u3042\u306d", "soto": "\u304a\u306d\u3048\u3055\u3093" },
{ "zh": "\u5f1f\u5f1f", "en": "Younger Brother", "uchi": "\u304a\u3068\u3046\u3068", "soto": "\u304a\u3068\u3046\u3068\u3055\u3093" },
{ "zh": "\u59b9\u59b9", "en": "Younger Sister", "uchi": "\u3044\u3082\u3046\u3068", "soto": "\u3044\u3082\u3046\u3068\u3055\u3093" }
]

uchiPrompts = [
{ "zh": "\u5728\u9b54\u836f\u8bfe\u4e0a\uff0c\u65af\u5185\u666e\u6559\u6388\u6279\u8bc4\u4f60\u7684\u836f\u6c34\u989c\u8272\u4e0d\u5bf9\uff0c\u4f60\u5c0f\u58f0\u561f\u56d4\u4f60\u7684\u3010{zh}\u3011\u5e73\u65f6\u5728\u5bb6\u5c31\u662f\u8fd9\u4e48\u71ac\u7684...", "en": "In Potions class, Snape criticizes your potion's color. You mutter that your [{en}] always brews it this way at home..." },
{ "zh": "\u6536\u5230\u543c\u53eb\u4fe1\uff01\u6574\u4e2a\u5927\u5802\u90fd\u5b89\u975c\u4e86\uff0c\u4f60\u5c34\u5c2c\u5730\u6342\u4f4f\u8138\uff0c\u90a3\u662f\u4f60\u7684\u3010{zh}\u3011\u5bc4\u6765\u9a82\u4f60\u4e0d\u53ca\u683c\u7684...", "en": "A Howler! The Great Hall goes silent. You cover your face in embarrassment as your [{en}] yells at you for failing..." }
]

sotoPrompts = [
{ "zh": "\u4f60\u5728\u56fd\u738b\u5341\u5b57\u8f66\u7ad99\u00be\u7ad9\u53f0\u9047\u5230\u540c\u5b66\uff0c\u4f60\u8d70\u4e0a\u524d\u793c\u8c8c\u5730\u5411\u4ed6\u7684\u3010{zh}\u3011\u95ee\u597d...", "en": "At Platform 9 3/4, you step forward to politely greet your classmate's [{en}]..." },
{ "zh": "\u8d6b\u654f\u6b63\u5728\u56fe\u4e66\u9986\u7ffb\u9605\u9ebb\u74dc\u5386\u53f2\u4e66\uff0c\u4f60\u597d\u5947\u5730\u8d70\u8fc7\u53bb\uff0c\u8be2\u95ee\u5979\u7684\u3010{zh}\u3011\u662f\u4e0d\u662f\u4e5f\u61c2\u8fd9\u4e9b...", "en": "Hermione is devouring Muggle history books. You ask if her [{en}] also understands this stuff..." }
]

i18n = {
  "zh": {
    "title": "Eastern Charms O.W.L.",
    "subtitle": "Drag and drop the parchments!",
    "uchiBtn": "Uchi Trial",
    "sotoBtn": "Soto Trial",
    "mixedBtn": "Mixed Test",
    "scoreLabel": "Points",
    "progressLabel": "Progress",
    "uchiTag": "Own Family (Uchi)",
    "sotoTag": "Others (Soto)",
    "correct": "Correct!",
    "wrong": "Wrong!",
    "resultTitle": "Results",
    "finalScore": "Score",
    "gradeLabel": "Grade",
    "restart": "Restart",
    "resetNotice": "Reshuffled",
    "grades": {
      "O": { "grade": "O", "msg": "Outstanding!" },
      "E": { "grade": "E", "msg": "Exceeds Expectations" },
      "A": { "grade": "A", "msg": "Acceptable" },
      "P": { "grade": "P", "msg": "Poor" },
      "T": { "grade": "T", "msg": "Troll" }
    }
  },
  "en": {
    "title": "Eastern Charms O.W.L.",
    "subtitle": "Click a button to start.",
    "uchiBtn": "Uchi Trial - Refer to your own family",
    "sotoBtn": "Soto Trial - Refer to others' family",
    "mixedBtn": "Ultimate O.W.L. Test (Mixed)",
    "scoreLabel": "House Points",
    "progressLabel": "Progress",
    "uchiTag": "Own Family (Uchi)",
    "sotoTag": "Others' Family (Soto)",
    "correct": "Correct! +10 pts",
    "wrong": "Spell Rebounded! Correct:",
    "resultTitle": "O.W.L. Results",
    "finalScore": "Final Score",
    "gradeLabel": "Overall Grade",
    "restart": "Retake Exam",
    "resetNotice": "Question pool reshuffled!",
    "grades": {
      "O": { "grade": "O (Outstanding)", "msg": "Merlin's beard! A perfect display of Charms!" },
      "E": { "grade": "E (Exceeds Expectations)", "msg": "Well done! You won't embarrass yourself at the Ministry." },
      "A": { "grade": "A (Acceptable)", "msg": "Barely passed! A bit stumbling, but at least nothing exploded." },
      "P": { "grade": "P (Poor)", "msg": "You need more time in the library reviewing Uchi/Soto!" },
      "T": { "grade": "T (Troll)", "msg": "Blimey! You called someone else's father your own! Go revise!" }
    }
  }
}

new_content = "// --- DATA START ---\n"
new_content += "const familyData = " + json.dumps(familyData, ensure_ascii=False, indent=2) + ";\n"
new_content += "const uchiPrompts = " + json.dumps(uchiPrompts, ensure_ascii=False, indent=2) + ";\n"
new_content += "const sotoPrompts = " + json.dumps(sotoPrompts, ensure_ascii=False, indent=2) + ";\n"
new_content += "const i18n = " + json.dumps(i18n, ensure_ascii=False, indent=2) + ";\n"

filepath = 'content/University/Japanese/Family/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace everything from "// --- 数据区" to "function HogwartsJapaneseExam"
start_str = "// --- \u6570\u636e\u533a\uff1a\u5bb6\u4eba\u79f0\u547c\u8bcd\u5e93 ---"
end_str = "function HogwartsJapaneseExam"

start_idx = text.find(start_str)
end_idx = text.find(end_str)

if start_idx != -1 and end_idx != -1:
    final_text = text[:start_idx] + new_content + "\n" + text[end_idx:]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(final_text)
    print("Successfully replaced content!")
else:
    print("Could not find markers!")
