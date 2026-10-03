"""Prepare display-only source strips; original questions, answers and PNGs stay intact."""
from pathlib import Path
import json
import re
import pdfplumber
from PIL import Image

root = Path(__file__).resolve().parent.parent
module = root / 'content/SPM_Syllabus/Form2/Science/UASA_2024'
bank = json.loads((module/'data.js').read_text(encoding='utf-8').removeprefix('window.UASA_SCIENCE = ').rstrip(';\n'))
layouts = {}
with pdfplumber.open(module/'source.pdf') as pdf:
    for q in bank['questions']:
        for asset, rect in zip(q['images'], q['sourceRects']):
            page_no, x0, y0, x1, y1 = rect
            page = pdf.pages[page_no-1]
            box = (page.width*x0, page.height*y0, page.width*x1, page.height*y1)
            cropped = page.crop(box)
            intervals = []
            for line in cropped.extract_text_lines():
                # Dotted writing lines contain no question wording or figure labels.
                if re.search(r'[A-Za-z0-9]', line['text']) or len(line['text']) < 8:
                    intervals.append((line['top']-2.5, line['bottom']+2.5))
            for image in cropped.images:
                intervals.append((max(box[1],image['top'])-2, min(box[3],image['bottom'])+2))
            for table in page.find_tables():
                tx0, ty0, tx1, ty1 = table.bbox
                if tx0 >= box[0]-3 and tx1 <= box[2]+3 and ty0 >= box[1]-3 and ty1 <= box[3]+3:
                    if re.search(r'[A-Za-z0-9]', page.crop(table.bbox).extract_text() or ''):
                        intervals.append((ty0-2, ty1+2))
            intervals = sorted((max(box[1],a), min(box[3],b)) for a,b in intervals if b>box[1] and a<box[3])
            merged=[]
            for a,b in intervals:
                if merged and a <= merged[-1][1]+5:
                    merged[-1][1]=max(merged[-1][1],b)
                else:
                    merged.append([a,b])
            # Same rounding as the original PDF-to-PNG extraction.
            height = Image.open(module/asset).height
            scale = 2200/page.height
            crop_top = round(page.height*y0*scale)
            strips = [[max(0,round(a*scale)-crop_top),min(height,round(b*scale)-crop_top)] for a,b in merged]
            strips = [s for s in strips if s[1]>s[0]]
            assert strips, asset
            # Every question text line must remain inside a displayed strip.
            for line in cropped.extract_text_lines():
                if re.search(r'[A-Za-z0-9]',line['text']):
                    top=round(line['top']*scale)-crop_top
                    bottom=round(line['bottom']*scale)-crop_top
                    assert any(a<=top and b>=bottom for a,b in strips), (asset,line['text'])
            layouts[asset]={'strips':strips,'height':sum(b-a for a,b in strips),'sourceHeight':height}
(module/'question-layout.js').write_text('window.UASA_QUESTION_LAYOUT = '+json.dumps(layouts,indent=2)+';\n',encoding='utf-8')
print('Verified display strips for',len(layouts),'source images; question text, figures and tables preserved.')
