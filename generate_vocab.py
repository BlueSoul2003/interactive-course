import json
import re
import urllib.request

# Since the previous extraction was messy, let's just generate a strong list of 40 words for Year 6 based on typical Unit 1 and Unit 2 vocabulary (Emergency, Scenario, Occupations, Reading).

vocab = [
    # Stage 1: Occupations & Roles (Unit 2 related)
    {"en": "journalist", "zh": "记者"},
    {"en": "photographer", "zh": "摄影师"},
    {"en": "mechanic", "zh": "技工"},
    {"en": "chef", "zh": "厨师"},
    {"en": "architect", "zh": "建筑师"},
    {"en": "dentist", "zh": "牙医"},
    {"en": "accountant", "zh": "会计师"},
    {"en": "engineer", "zh": "工程师"},
    {"en": "scientist", "zh": "科学家"},
    {"en": "veterinarian", "zh": "兽医"},
    
    # Stage 2: Scenarios & Emergencies (Unit 1 related)
    {"en": "emergency", "zh": "紧急情况"},
    {"en": "accident", "zh": "意外"},
    {"en": "ambulance", "zh": "救护车"},
    {"en": "injured", "zh": "受伤的"},
    {"en": "hospital", "zh": "医院"},
    {"en": "paramedic", "zh": "医务人员"},
    {"en": "rescue", "zh": "救援"},
    {"en": "siren", "zh": "警报器"},
    {"en": "bleeding", "zh": "流血"},
    {"en": "fainted", "zh": "晕倒"},
    
    # Stage 3: Actions & Verbs (Unit 1 & 2 Past Continuous / Used to)
    {"en": "was walking", "zh": "正在走 (过去)"},
    {"en": "were playing", "zh": "正在玩 (过去)"},
    {"en": "used to read", "zh": "过去常读"},
    {"en": "used to write", "zh": "过去常写"},
    {"en": "happened", "zh": "发生"},
    {"en": "witnessed", "zh": "目击"},
    {"en": "called", "zh": "打电话"},
    {"en": "arrived", "zh": "到达"},
    {"en": "explained", "zh": "解释"},
    {"en": "investigated", "zh": "调查"},
    
    # Stage 4: Diary & Feelings (Unit 1 & 2)
    {"en": "diary", "zh": "日记"},
    {"en": "scared", "zh": "害怕的"},
    {"en": "relieved", "zh": "松了一口的"},
    {"en": "exhausted", "zh": "筋疲力尽的"},
    {"en": "anxious", "zh": "焦虑的"},
    {"en": "brave", "zh": "勇敢的"},
    {"en": "grateful", "zh": "感激的"},
    {"en": "terrified", "zh": "极度恐惧的"},
    {"en": "calm", "zh": "冷静的"},
    {"en": "worried", "zh": "担心的"}
]

print(json.dumps(vocab, ensure_ascii=False, indent=2))
