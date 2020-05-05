#encoding=utf-8
#!/usr/bin/python3
from flask import Flask
from flask import render_template, request
from gevent import pywsgi
import os, sys
import urllib.request
import pickle, json
import jieba
import numpy as np
from reptile import *
sys.path.append('data')

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def update_KG():
    return render_template('update_page.html')

# 爬虫
@app.route('/catch', methods=['GET', 'POST'])
def catch_text():
    url = request.form['url'].strip()
    text = reptile(url)
    print(text.strip())
    text = {"text": text.strip()}
    return json.dumps(text)

# 分词/实体抽取
@app.route('/split', methods=['GET', 'POST'])
def split_text():
    text = request.form['text'].strip()
    words = [w for w in jieba.cut(text)]
    belong = np.random.randint(-1,3,len(words))
    belong = belong.tolist()
    ent_ch = ["人名", "地名", "机构名"]
    ent_en = ["PER", "LOC", "ORG"]
    entity = [
        ['中国', 'LOC', 0, 2],
        ['习近平', 'PER', 2, 5],
        ['美国', 'LOC', 6, 8],
        ['特朗普', 'PER', 8, 11],
        ['人大', 'ORG', 12, 14],
        ['众议院', 'ORG', 14, 17]
    ]
    attr_ch = ["国籍", "性别", "成立时间"]
    attr_en = ['country', 'sex', 'estab_time']
    attr_ent = ['PER', 'PER', 'ORG']
    attribute = []
    giveback = {
        "ent_ch": ent_ch,
        "ent_en": ent_en,
        "entity": [],
        "attr_ch": attr_ch,
        "attr_en": attr_en,
        "attribute": attribute,
        "attr_ent": attr_ent
        }
    print(giveback)
    return json.dumps(giveback)

# 实体置信度
@app.route('/entityConfidence', methods=['GET', 'POST'])
def entity_confidence():
    items = request.form['items'].split('==')[:-1]
    confidence = []
    for item in items:
        confidence.append([item, np.random.randint(75,100)])
    check_score = {
        'confidence': confidence
    }
    return json.dumps(check_score)

# 三元组置信度
@app.route('/tripleConfidence', methods=['GET', 'POST'])
def triple_confidence():
    data = request.form['entity']
    print(request.form['entity'])
    entity = [
        ["习近平","特朗普","安倍晋三","文在寅"],
        ["中国","美国","日本","韩国"],
        ["人大","众议院","内阁","国会"]
    ]
    synonym = [
        [['习主席'],['川普'],[],[]],
        [['中华人民共和国','中华','华夏'],['美利坚合众国','美帝','米国'],[],[]],
        [[],[],[],[]]
    ]
    score = [
        [[100],[90],[],[]],
        [[96,93,88],[95,92,90],[],[]],
        [[],[],[],[]]
    ]
    if(data != 'ready'):
        entity = data
        synonym = []
        score = []
    resolve_score = {
        'ent': entity,
        'syn': synonym,
        'score': score
    }
    return json.dumps(resolve_score)

# 解析前端上传的表单，获取类别和实体/属性
def get_cats_and_items(tag, form):
    length = int(request.form['length-'+tag])
    cats = []
    items = []
    for i in range(length):
        print(i)
        print(request.form[str(i)+'-'+tag])
        cat = request.form[str(i)+'-'+tag].split('$$')[0]
        item = request.form[str(i)+'-'+tag].split('$$')[1].split('===')[:-1]
        for i in item:
            cats.append(cat)
            items.append(i)
    return cats, items
# 生成三元组
@app.route('/triple', methods=['GET', 'POST'])
def generate_triple():
    ent_cats, ents = get_cats_and_items('ent', request.form)
    attr_cats, attrs = get_cats_and_items('attr', request.form)
    
    print(ents)
    print(attrs)
    triples_ent = [[['特朗普', 'PER', 0, 3], ['习近平', 'PER', 4, 7], '朋友', 85, 0], [['科协', 'ORG', 11, 13], ['学生会', 'ORG', 14, 17], '同级', 90, 0]]
    triples_attr = [[['特朗普', 'PER', 15, 18], ['美国', 'country', 26, 28], '国籍', 85, 0], [['特朗普', 'PER', 40, 43], ['男', 'sex', 40, 43], '性别', 88, 0]]
    reply={
        "tri-ent": triples_ent,
        "tri-attr": triples_attr
    }
    return json.dumps(reply)

# 实体消歧
@app.route('/EntityDisambiguate', methods=['GET', 'POST'])
def entity_disambiguate():

    ED = [
        [
            ['小米', '小米全靠友商衬托,小米全靠友商衬托,小米全靠友商衬托,小米全靠友商衬托,小米全靠友商衬托', 1], 
            [['粮食', '禾本科狗尾草属一年生草本'], ['科技企业', '北京小米科技有限责任公司'], ['电视剧角色', '武林外传中的人物']]
            ],
        [
            ['苹果', '一天一苹果，敌人远离我', 0], 
            [['水果', '蔷薇科苹果属植物'], ['科技企业', '美国一家高科技公司']]
            ]
    ]
    check_score = {
        'ED': ED
    }
    return json.dumps(check_score)
# 指代消解
@app.route('/CoreferenceResolve', methods=['GET', 'POST'])
def coreference_resolve():
    CR = [
        [
            ['特朗普', '特朗普很好地帮华为做了广告', 0], 
            [['川普', '特朗普的简称'], ['川建国', '美国总统特朗普在中国网络社区中的别称'], ['美国第45任总统', '唐纳德·特朗普']]
            ],
        [
            ['诸葛亮', '《出师表》的作者是诸葛亮', 0], 
            [['孔明', '三国时期蜀汉丞相'], ['卧龙', '，三国时期蜀汉丞相']]
            ]
    ]
    check_score = {
        'CR': CR,
    }
    return json.dumps(check_score)

# 生成数据库存储语言
@app.route('/neo4j', methods=['GET', 'POST'])
def neo4j_KG():
    # 修改后的三元组
    graph = request.form
    graph = graph.to_dict(flat = False)
    n_name = graph["nodes[name]"]
    n_cat = graph["nodes[category]"]
    out = open("neo4j.txt", 'w', encoding='utf-8')
    for i in range(len(n_name)):
        command = 'create(' + n_name[i] + ':' + n_cat[i] + '{name:\'' + n_name[i] + '\', cat:\'' + n_cat[i] + '\'})\n'
        out.write(command)

    e_e1 = graph["edges[e1]"]
    e_cat1 = graph["edges[category1]"]
    e_e2 = graph["edges[e2]"]
    e_cat2 = graph["edges[category2]"]
    relation = graph["edges[label]"]
    for i in range(len(e_e1)):
        command = 'create(' + e_e1[i] +')-[:' + relation[i] +']->(' + e_e2[i] + ')\n'
        out.write(command)

    return json.dumps({10:10})

if __name__ == "__main__":
    app.run(host='0.0.0.0', threaded=True)
    # app.run(port=4555, debug=True)
    #server = pywsgi.WSGIServer(('0.0.0.0', 5003), app)
    #server.serve_forever()
