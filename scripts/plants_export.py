#!/usr/bin/env python3
import json, csv, sys
sys.path.insert(0, 'cg-field-app')
from plants import PLANTS

with open('plants_export.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Botanical','Common','Size','Target','Aggression','Type','Fertilize'])
    for p in PLANTS:
        writer.writerow([p.get('botanical',''), p.get('common',''), p.get('size',''), 
                         p.get('target',''), p.get('aggression',''), p.get('type',''), 
                         p.get('fertilize','')])

print(f'Exported {len(PLANTS)} plants to plants_export.csv')