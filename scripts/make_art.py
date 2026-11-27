from PIL import Image,ImageColor,ImageDraw,ImageFilter,ImageOps
from pathlib import Path
import random
out=Path(__file__).parent.parent/'products'
ink='#24211f'; ivory='#f4e9d6'; orange='#ff580b'
blue='#1b46c2'; red='#c62e2e'
# Reuse the original drawings and stable item numbers for Bolt Space.
club_palettes = {
    0: {orange: red, '#bb3905': '#8f252c', '#fff7ec': '#fffdf6'},
    3: {ivory: '#f7f6ed', ink: blue, '#b5a791': '#9baccf'},
    5: {ink: blue, '#45403a': '#112d84', '#fff7ec': '#fffdf6'},
}
def make(i,kind,color):
    im=Image.new('RGBA',(72,82))
    d=ImageDraw.Draw(im)
    def poly(points,fill,edge=None): d.polygon(points,fill,outline=edge)
    def line(points,fill,width=1): d.line(points,fill,width)
    def bolt(x,y,s,t):
        poly([(x+int(a*s),y+int(b*s)) for a,b in [(11,0),(1,12),(6,12),(0,22),(15,8),(9,8)]],t)
    accent=orange if color==ivory else '#fff7ec'
    seam={orange:'#bb3905',ivory:'#b5a791',ink:'#45403a'}[color]
    if kind=='tank':
        poly([(18,5),(24,5),(26,14),(31,19),(39,19),(44,14),(46,5),(52,5),(53,18),(56,26),(59,29),(59,75),(13,75),(13,30),(17,24)],color,seam)
        line([(18,7),(20,8),(20,22),(15,32)],seam);line([(24,6),(27,16),(32,21),(39,21),(45,15),(48,6)],seam,2)
        line([(15,72),(56,72)],seam);line([(16,36),(17,65)],seam)
        if i==7:
            poly([(14,65),(58,47),(58,54),(14,72)],orange);poly([(35,74),(58,64),(58,69),(48,74)],orange)
        if color==ivory:
            for x in (15,19,53,57):line([(x,50),(x,72)],orange,2)
        bolt(29,29,1.05,accent)
    elif kind=='cap':
        poly([(12,45),(14,34),(18,25),(25,19),(34,16),(46,16),(54,20),(61,26),(64,35),(64,48),(57,53),(48,54),(39,51),(25,52),(12,56),(4,56),(3,53)],color,seam)
        poly([(4,52),(15,45),(35,41),(57,42),(58,45),(31,46),(12,53),(4,55)],seam)
        line([(44,18),(49,24),(52,33),(52,40)],seam);line([(35,17),(30,22),(27,29)],seam);d.rectangle((35,14,40,16),fill=seam);bolt(22,24,.66,accent)
    elif kind in ('tee','sweat'):
        hem=47 if kind=='tee' else 74
        poly([(24,12),(29,11),(32,16),(40,16),(44,11),(50,13),(60,18),(65,23),(70,hem-4),(58,hem),(52,30),(53,74),(19,74),(20,30),(14,hem),(2,hem-3),(7,24),(13,18)],color,seam)
        line([(26,13),(30,19),(39,20),(45,13)],seam,2);line([(21,71),(50,71)],seam)
        for x in (20,49):line([(x,39),(x+1,64)],seam)
        bolt(29 if kind=='tee' else 40,32 if kind=='tee' else 24,1 if kind=='tee' else .53,accent)
    elif kind=='shorts':
        poly([(13,20),(57,20),(68,61),(40,67),(35,48),(30,67),(4,62)],color,seam)
        for y in (22,25,28):line([(15,y),(55,y)],seam)
        for x,k in ((14,-7),(56,8)):line([(x,31),(x+k,59)],orange,3)
        line([(31,26),(35,29),(33,36)],seam);line([(37,27),(40,34)],seam);bolt(46,45,.65,accent)
    elif kind=='tote':
        line([(21,35),(22,18),(26,9),(32,6),(39,6),(45,11),(48,18),(49,36)],ink,4)
        poly([(12,31),(59,31),(62,73),(9,73)],ivory,ink)
        line([(13,35),(57,35)],seam);line([(14,69),(57,69)],seam);bolt(29,41,.95,orange)
    elif kind=='socks':
        for x,y in ((34,6),(11,12)):
            poly([(x+3,y),(x+21,y),(x+19,y+35),(x+14,y+45),(x+2,y+57),(x-4,y+59),(x-9,y+55),(x-9,y+49),(x+2,y+34)],ivory,ink)
            for dy,stripe in ((7, blue), (12, red)):
                line([(x+4,y+dy),(x+19,y+dy)],stripe,3)
            line([(x+3,y+35),(x+9,y+39)],seam)
    elif kind=='bottle':
        d.rounded_rectangle((27,5,48,17),radius=4,outline=ink,width=4);d.rectangle((23,15,46,22),fill=ink)
        poly([(23,23),(46,23),(50,32),(49,73),(46,76),(20,76),(18,72),(19,31)],color,seam)
        for y in (31,69):line([(21,y),(47,y)],seam,2)
        line([(22,35),(22,66)],'#ffa146',2);bolt(27,37,1,accent)
    palette = {ImageColor.getrgb(a): ImageColor.getrgb(b)
               for a,b in club_palettes.get(i, {}).items()}
    rng=random.Random(i+112)
    for y in range(82):
        for x in range(72):
            r,g,b,a=im.getpixel((x,y))
            if a:
                r,g,b = palette.get((r,g,b), (r,g,b))
                n=rng.uniform(-8,8)+(4 if x%3==0 else -3)+(4 if y%3==0 else 0)
                if palette and (x + 2*y) % 5 < 3:
                    n = 0
                im.putpixel((x,y),tuple(max(0,min(255,round(v+n))) for v in (r,g,b))+(255,))
    # Give dilation room even when a sleeve ends against the drawing canvas.
    im = ImageOps.expand(im, border=5, fill=(0,0,0,0))
    rim = im.getchannel('A').filter(ImageFilter.MaxFilter(5))
    sticker = Image.new('RGBA', im.size, 'white')
    sticker.putalpha(rim)
    sticker.alpha_composite(im)
    framed = ImageOps.expand(sticker.crop(sticker.getbbox()), border=3, fill=(0,0,0,0))
    framed.save(out/f'{i+1:02}.png')
for i,(k,c) in enumerate([('tank',orange),('cap',ink),('tank',ivory),('socks',ivory),('sweat',ivory),('tee',ink),('cap',orange),('tank',ink),('tote',ivory),('shorts',ink),('bottle',orange)]):make(i,k,c)
