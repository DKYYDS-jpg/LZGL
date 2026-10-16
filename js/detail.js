/* ==========================================================
   详情页 | 数据 + 渲染
   ========================================================== */

/* ==========================================================
   详情页 | 数据 + 渲染
   ========================================================== */

const DETAIL_DATA = {

  /* ============================================================
     一、文旅新貌（9 个）
     ============================================================ */

  taiping: {
    category: '文旅新貌',
    title: '太平古镇',
    subtitle: '国家AAAA级旅游景区 · 没有围墙的红色博物馆',
    images: ['images/taiping-1.webp', 
            'images/taiping-2.webp', 
            'images/taiping-3.webp', 
            'images/taiping-4.webp', 
            'images/taiping-5.webp'
],

    intro: '太平古镇位于古蔺河与赤水河交汇处，被誉为“赤水明珠”。古镇依山而建，现存204栋明清建筑，采用干阑式和吊脚楼构架。',
    content: [
      '太平古镇是红军长征四渡赤水的核心承载地。1935年2月，中央红军在太平渡架设浮桥三座，渡河兵力1.2万人，完成二渡赤水，挥师东进重入贵州。',
      '古镇完整保留了明清时期的建筑格局，吊脚楼错落有致，青石板路蜿蜒曲折。镇内拥有中国工农红军四渡赤水太平渡陈列馆、太平渡渡口纪念碑、红军总司令部驻地等多处文保单位，馆藏700余件革命文物。',
      '2025年国庆中秋双节期间，太平古镇累计接待游客近4万人次，同比增长17.43%，旅游综合消费突破500万元，县外游客占比高达80%，是古蔺红色旅游的核心目的地。'
    ],
    stats: ['国家AAAA级', '明清建筑 204栋', '红色文物 700余件', '双节游客近4万']
  },

  lake: {
    category: '文旅新貌',
    title: '观文千鸟湖',
    subtitle: '网红玻璃栈道 · 万只候鸟越冬地',
    images: ['images/guanwen-lake.webp', 
            'images/guanwen-lake-2.webp', 
            'images/guanwen-lake-3.webp', 
            'images/guanwen-lake-4.webp', 
            'images/guanwen-lake-5.webp'
],
    intro: '观文千鸟湖位于古蔺县观文镇，是集湖光山色、候鸟观赏、休闲度假为一体的生态旅游景区。',
    content: [
      '湖面开阔，水质清澈，每年冬季有上万只候鸟在此越冬，是川南地区重要的候鸟栖息地。',
      '景区新建的玻璃栈道观景台已成为网红打卡新地标，站在观景台上可俯瞰千鸟湖全景。',
      '2025年国庆中秋假期，千鸟湖吸引逾万名游客，直接带动观文镇“吃住行游购娱”全链条消费增长，成为古蔺农文旅融合发展的典范。'
    ],
    stats: ['网红新地标', '万只候鸟越冬', '国庆游客逾万名', '生态旅游典范']
  },

  daheidong: {
    category: '文旅新貌',
    title: '大黑洞景区',
    subtitle: '国家AAAA级旅游景区 · 苗寨民俗文化区',
    images: ['images/dahei-cave/dahei-cave1.webp', 
            'images/dahei-cave/dahei-cave2.webp', 
            'images/dahei-cave/dahei-cave3.webp', 
            'images/dahei-cave/dahei-cave4.webp', 
            'images/dahei-cave/dahei-cave5.webp'
],
    intro: '大黑洞景区位于箭竹苗族乡，拥有喀斯特地貌、森林、草场等自然景观和苗族传统文化人文景观。',
    content: [
      '景区主要分为苗寨民俗文化区、大黑洞秘境观光区、哆彩苗岭休闲游憩区三大板块。溶洞空间高度差300余米，是川南地区重要的喀斯特洞穴景观。',
      '每年正月初三的踩山节、七月初三的风情节集中展现苗家风情，游客可以体验苗族歌舞、服饰、蜡染、刺绣等传统文化。',
      '洞内保存着神秘的剿匪故事和当年土匪在洞内的生活资料，历史与自然景观交融。春节期间举办苗家踩山节，接待游客6.1万人次。'
    ],
    stats: ['国家AAAA级', '高度差300余米', '春节游客6.1万', '喀斯特溶洞']
  },

  huangjing: {
    category: '文旅新貌',
    title: '黄荆老林',
    subtitle: '国家AAAA级旅游景区 · 北纬28度最后的处女地',
    images: ['images/huangjing-forest/huangjing-forest1.webp', 
            'images/huangjing-forest/huangjing-forest2.webp', 
            'images/huangjing-forest/huangjing-forest3.webp', 
            'images/huangjing-forest/huangjing-forest4.webp', 
            'images/huangjing-forest/huangjing-forest5.webp'
],
    intro: '黄荆老林是地球北纬28°唯一保存完好的亚热带原始常绿阔叶林区，被誉为“北纬28度线上最后的处女地”。',
    content: [
      '景区占地面积433平方千米，森林覆盖率高达98%以上，集瀑布群落、原始林海、高山湖泊、丹霞绝壁、云海佛光于一体。',
      '拥有珙桐、红豆杉、桫椤等国家一、二类保护植物，是川南地区重要的生物多样性保护区。',
      '2025年6月以来，黄荆老林接待游客近2万人次，同比增长约10%，单日最高接待量达1100人次，是夏季避暑和生态旅游的热门目的地。'
    ],
    stats: ['国家AAAA级', '森林覆盖率98%', '占地面积433km²', '北纬28度唯一']
  },

  gulang: {
    category: '文旅新貌',
    title: '古郎景区',
    subtitle: '国家AAAA级旅游景区 · 川黔渝生态旅游金三角',
    images: ['images/gulang-cave/gulang-cave1.webp', 
            'images/gulang-cave/gulang-cave2.webp', 
            'images/gulang-cave/gulang-cave3.webp', 
            'images/gulang-cave/gulang-cave4.webp', 
            'images/gulang-cave/gulang-cave5.webp'
],
    intro: '古郎景区原名青龙洞，位于东新镇，是集溶洞观光、峡谷探秘、户外探险于一体的复合型景区。',
    content: [
      '古郎洞形成于白垩纪年代，至今已有几亿年历史，是川渝地区地质遗迹形态较完整、洞穴景观品类较丰富的喀斯特洞穴。',
      '全洞共分上、中、下三层，洞中有洞，洞中有水，洞内面积近60万平方米，地下暗河长达数十千米。',
      '景区核心景观包括形成于白垩纪的青龙洞与盐井峡谷，是川黔渝生态旅游金三角的重要节点。'
    ],
    stats: ['国家AAAA级', '白垩纪形成', '洞内60万m²', '地下暗河数十公里']
  },

  honglonghu: {
    category: '文旅新貌',
    title: '红龙湖森林公园',
    subtitle: '省级森林公园 · 丹霞地貌与湖光山色',
    images: ['images/honglong-lake/honglong-lake1.webp', 
            'images/honglong-lake/honglong-lake2.webp', 
            'images/honglong-lake/honglong-lake3.webp', 
            'images/honglong-lake/honglong-lake4.webp', 
            'images/honglong-lake/honglong-lake5.webp'
],    
intro: '红龙湖森林公园距古蔺县城19.5公里，四周群山环抱，与黄荆老林景区紧密相连。',
    content: [
      '公园面积达30平方公里，海拔在1200—1843米之间，地质岩层为白垩系红色砂岩构成的中山峡谷丹霞地貌。',
      '湖区四周青山环抱，水如明镜，倒映着丹霞山峦，是古蔺重要的高山湖泊景观。',
      '在古蔺县景点人气榜中排名靠前，是本地居民休闲度假和外地游客生态旅游的重要选择。'
    ],
    stats: ['省级森林公园', '面积30km²', '海拔1843米', '丹霞地貌']
  },

  shuangsha: {
    category: '文旅新貌',
    title: '双沙花海',
    subtitle: '连续16届菜花节 · 累计游客超30万人次',
    images: ['images/flower-sea.webp', 
            'images/flower-sea-2.webp', 
            'images/flower-sea-3.webp', 
            'images/flower-sea-4.webp', 
            'images/flower-sea-5.webp'
],     
intro: '双沙镇以油菜花海和稻田景观为天然载体，自2008年培育出古蔺第一个农旅融合节庆品牌——菜花旅游文化节。',
    content: [
      '菜花旅游文化节至今已连续举办16届，累计吸引游客超30万人次，是川南地区最受欢迎的春日打卡地之一。',
      '当地将火锅搬进花田，实现农旅结合，带动了餐饮、住宿、农产品销售的全链条发展。',
      '另有白马民宿度假村等乡村旅游点，春节期间举办灯光秀，吸引游客3.7万人次，是古蔺乡村振兴的重要品牌。'
    ],
    stats: ['连续16届', '累计游客30万+', '农旅融合', '万亩花海']
  },

  jianzhu: {
    category: '文旅新貌',
    title: '箭竹苗族乡',
    subtitle: '古蔺景点人气榜第1名 · 地质奇观+红色记忆',
    images: ['images/miao-town/miao-village1.webp', 
            'images/miao-town/miao-village2.webp', 
            'images/miao-town/miao-village3.webp', 
            'images/miao-town/miao-village4.webp', 
            'images/miao-town/miao-village5.webp'
],    intro: '箭竹苗族乡位于古蔺县东北部，是古蔺苗族文化的重要聚居地，以“地质奇观+红色记忆”双循环动线为核心。',
    content: [
      '境内拥有大黑洞景区和丰富的苗族文化遗产，是古蔺县景点人气榜第1名，共44条点评。',
      '每年正月初三的踩山节、七月初三的风情节集中展现苗家风情，是体验古蔺苗族文化的最佳目的地。',
      '这里也是古蔺苗族蜡染、刺绣、芦笙制作等非遗技艺的重要传承地。'
    ],
    stats: ['景点人气榜第1', '44条点评', '苗乡风情', '非遗传承地']
  },

  'mashi-scene': {
    category: '文旅新貌',
    title: '马嘶苗族乡',
    subtitle: '沉浸式茶旅廊道 · 茶马古道活态博物馆',
     images: ['images/masi-tea-1.webp', 
            'images/masi-tea-2.webp', 
            'images/masi-tea-3.webp', 
            'images/masi-tea-4.webp', 
            'images/masi-tea-5.webp'
], 
    intro: '马嘶苗族乡以三映路为轴线，串联苗岭秘境三元洞府、川南百年民居赢家大院、茶文化地标奢府茗茶等核心景点。',
    content: [
      '打造数十公里沉浸式茶旅廊道，立体呈现“茶马古道活态博物馆”的独特魅力。',
      '游客可以亲手采茶、制茶，体验苗族蜡染、苗绣等非遗技艺，感受苗乡的独特风情。',
      '马嘶苗族乡茶文化周已成为古蔺文旅融合的重要品牌活动，构建“苗乡文化传承、非遗技艺活化、生态茶园建设、红色基因赓续”四位协同的文旅融合体系。'
    ],
    stats: ['沉浸式茶旅', '茶马古道', '苗乡文化', '生态茶园']
  },

  /* ============================================================
     二、美食古蔺 · 主卡片（7 个）
     ============================================================ */

  chicken: {
    category: '美食古蔺',
    title: '古蔺麻辣鸡',
    subtitle: '美食界“一哥” · 国家地理标志',
       images: ['images/gulin-malaji-1.webp', 
            'images/gulin-malaji-2.webp', 
            'images/gulin-malaji-3.webp', 
            'images/gulin-malaji-4.webp', 
            'images/gulin-malaji-5.webp'
],
    intro: '古蔺麻辣鸡是古蔺最具代表性的美食名片，国家地理标志证明商标，四川省非物质文化遗产代表性项目。',
    content: [
      '选用当地高山土鸡，经秘制卤水卤制后，佐以特制麻辣蘸水食用，以“鲜、香、麻、辣”著称，肉质细嫩、皮脆脱骨。',
      '曾登上央视《舌尖上的中国2》，获评“中华特色名小吃”，被川南网评为古蔺美食界“一哥”。',
      '2022年销售240万余只，产值近2.3亿元，销量连年增长约20%，产品远销海内外。'
    ],
    stats: ['国家地理标志', '省级非遗', '年销240万只', '产值2.3亿']
  },

  noodle: {
    category: '美食古蔺',
    title: '古蔺手工面',
    subtitle: '国家地理标志 · 产值3.3亿',
        images: ['images/gulin-noodle-1.webp', 
            'images/gulin-noodle-2.webp', 
            'images/gulin-noodle-3.webp', 
            'images/gulin-noodle-4.webp', 
            'images/gulin-noodle-5.webp'
],
    intro: '古蔺手工面是国家地理标志证明商标，泸州市非物质文化遗产，制作技艺可追溯至清朝末年，已有上百年历史。',
    content: [
      '以筋道爽滑著称，2025年产销量突破5.2万吨，销售额3.3亿元，全县有面厂8家、面坊180余家，近3000人从事面条相关行业。',
      '曾登上央视《舌尖上的中国2》《走遍中国》等栏目，远销澳大利亚、新加坡、俄罗斯等9个国家。',
      '包括梅氏手工面、税袁古蔺面等多个传承流派，是古蔺饮食文化的重要符号。'
    ],
    stats: ['国家地理标志', '市级非遗', '年产5.2万吨', '远销9个国家']
  },

  herb: {
    category: '美食古蔺',
    title: '古蔺赶黄草',
    subtitle: '国家地理标志 · 苗族“神仙草”',
         images: ['images/ganhuangcao-1.webp', 
            'images/ganhuangcao-2.webp', 
            'images/ganhuangcao-3.webp', 
            'images/ganhuangcao-4.webp', 
            'images/ganhuangcao-5.webp'
],
    intro: '赶黄草是古蔺道地药材，国家地理标志保护产品，被苗族视为“神仙草”，具有清热解毒、保肝护肝的功效。',
    content: [
      '古蔺是全国赶黄草地理认证产区，全县种植面积约2万亩，年产量超万吨，综合产值超15亿元。',
      '当地百姓将赶黄草制成茶饮，是日常保健的常用饮品，药食同源。',
      '古蔺正推动“全国肝康养基地县”建设，赶黄草已成为古蔺特色农业的重要支柱产业之一。'
    ],
    stats: ['国家地理标志', '药食同源', '种植2万亩', '产值15亿']
  },

  shibao: {
    category: '美食古蔺',
    title: '石宝红汤羊肉',
    subtitle: '省级名菜 · 入选“味美四川”',
             images: ['images/red-soup-mutton/mutton1.webp', 
            'images/red-soup-mutton/mutton2.webp', 
            'images/red-soup-mutton/mutton3.webp', 
            'images/red-soup-mutton/mutton4.webp', 
            'images/red-soup-mutton/mutton5.webp'
],
    intro: '石宝红汤羊肉采用当地马头羊为原料，肉色鲜红、肉质细嫩、脂肪分布均匀，成品口感麻而舒、辣而鲜，回味悠长。',
    content: [
      '石宝红汤羊肉发轫于千年茶盐古道，已获评市、县两级非物质文化遗产，入选“味美四川”名菜名录。',
      '2022年获评四川省150道乡村名菜，是古蔺美食的重要组成部分。',
      '第三届石宝高山羊肉文化节线上线下参与人数超200万人次，吸引游客超15万人次现场打卡，带动消费超500万元。'
    ],
    stats: ['省级名菜', '市县两级非遗', '游客15万人次', '带动消费500万']
  },

  pork: {
    category: '美食古蔺',
    title: '古蔺丫杈猪',
    subtitle: '国家保护品种 · 老腊肉是古蔺年味',
         images: ['images/larou.webp', 
            'images/gulin-pig-2.webp', 
            'images/gulin-pig-3.webp', 
            'images/gulin-pig-4.webp', 
            'images/gulin-pig-5.webp'
],
    intro: '古蔺丫杈猪是国家地理标志证明商标，因猪耳呈丫杈状而得名，是泸州市地方优良品种。',
    content: [
      '2012年被列入国家畜产品资源猪类重点保护品种，是古蔺山区农民增收的重要途径。',
      '以丫杈猪肉制作的老腊肉，是古蔺人过年必备的年味。每年冬季，家家户户熏制腊肉，香气弥漫山间。',
      '丫杈猪老腊肉传统制作技艺是古蔺县第四批非物质文化遗产代表性项目，经腌制、熏烤等传统工序制作，晶莹剔透，色泽诱人，肥而不腻，瘦而不柴。'
    ],
    stats: ['国家地理标志', '国家保护品种', '县级非遗', '古蔺年味']
  },

  wine: {
    category: '美食古蔺',
    title: '郎酒',
    subtitle: '中国两大酱香白酒之一',
          images: ['images/langjiu.webp', 
            'images/langjiu-2.webp', 
            'images/langjiu-3.webp', 
            'images/langjiu-4.webp', 
            'images/langjiu-5.webp'
],
    intro: '郎酒产自赤水河畔二郎镇，是中国两大酱香白酒之一，与茅台隔河相望。',
    content: [
      '郎酒以赤水河谷独特的微生物环境和天然溶洞贮藏而闻名，酒质醇厚、空杯留香。',
      '郎酒庄园将千年酿造技艺与现代工业美学完美融合，既是“中国酒谷”，更是文化地标，每年接待游客超过20万人次。',
      '古蔺郎酒端午制曲大典、重阳下沙大典均为古蔺县非物质文化遗产代表性民俗项目。'
    ],
    stats: ['中国两大酱香', '年接待20万人次', '赤水河畔', '县级非遗']
  },

  orange: {
    category: '美食古蔺',
    title: '古蔺甜橙',
    subtitle: '国家地理标志 · 5+N主导产业',
           images: ['images/gulin-orange-1.webp', 
            'images/gulin-orange-2.webp', 
            'images/gulin-orange-3.webp', 
            'images/gulin-orange-4.webp', 
            'images/gulin-orange-5.webp'
],
    intro: '古蔺甜橙是国家地理标志证明商标，赤水河谷独特的气候和土壤条件造就了皮薄多汁、酸甜适口的品质。',
    content: [
      '古蔺甜橙每年11月成熟，是古蔺秋冬季节的时令水果。',
      '近年来，古蔺甜橙通过电商渠道畅销全国，成为农民增收的重要来源。',
      '作为古蔺“5+N”现代农业体系的主导产业之一，甜橙种植已成为赤水河谷乡村振兴的重要支柱。'
    ],
    stats: ['国家地理标志', '11月成熟', '5+N 主导产业', '电商畅销全国']
  },

  /* ============================================================
     三、美食 · 标签云（9 个）
     ============================================================ */

  tofu: {
    category: '美食古蔺 · 更多风味',
    title: '石屏包浆豆腐',
    subtitle: '外焦里嫩 · 一咬流汁',
           images: ['images/tofu/tofu1.webp', 
            'images/tofu/tofu2.webp', 
            'images/tofu/tofu3.webp'
],
    intro: '石屏包浆豆腐外焦里嫩，一咬流汁，入口即化，是石屏镇的招牌小吃。',
    content: [
      '撒上秘制调味料、红油、辣椒面、熟芝麻、花生碎、折耳根等配料，风味独特。',
      '包浆豆腐是古蔺街头巷尾常见的小吃，深受本地居民和外地游客喜爱。'
    ],
    stats: ['石屏镇招牌', '外焦里嫩', '街头小吃']
  },

  yongle: {
    category: '美食古蔺 · 更多风味',
    title: '永乐羊肉汤',
    subtitle: '肉嫩化渣 · 没有膻味',
           images: ['images/mutton-soup/mutton-soup1.webp', 
            'images/mutton-soup/mutton-soup2.webp', 
            'images/mutton-soup/mutton-soup3.webp'
],
    intro: '永乐羊肉汤选用古蔺马头羊为原料，有红汤、清汤等做法。',
    content: [
      '具有肉嫩而化渣、没有膻味的特点，是古蔺人冬季进补的经典美食。',
      '永乐镇是古蔺羊肉汤的重要发源地，当地羊肉汤馆遍布城乡。'
    ],
    stats: ['马头羊', '红汤清汤', '冬季进补']
  },


  hotpot: {
    category: '美食古蔺 · 更多风味',
    title: '古蔺钟跷脚火锅',
    subtitle: '牛肉制品 · 桂花包闻名',
           images: ['images/hotpot/hotpot1.webp', 
            'images/hotpot/hotpot2.webp'
],
    intro: '古蔺钟跷脚火锅是古蔺特色美食，以其牛肉制品闻名。',
    content: [
      '传统名点“桂花包”以面粉、桂花、糖为原料，外皮柔软细腻，内馅香甜可口，是钟翘脚火锅店的招牌点心。',
      '火锅汤底浓郁，牛肉鲜嫩，是古蔺人聚餐的热门选择。'
    ],
    stats: ['牛肉火锅', '桂花包', '古蔺特色']
  },

  longtable: {
    category: '美食古蔺 · 更多风味',
    title: '苗家长桌宴',
    subtitle: '苗乡盛宴 · 场景壮观',
           images: ['images/long-table-banquet/long-table-banquet1.webp', 
            'images/long-table-banquet/long-table-banquet2.webp', 
            'images/long-table-banquet/long-table-banquet3.webp'
],
    intro: '苗家长桌宴是苗族最具传统特色的宴席形式，历史悠久，少则坐数十人，多则可达数百人。',
    content: [
      '宴上摆满苗家传统佳肴：猪刨汤、白切鸡、素豆花、老腊肉、八块鸡、肥肠鱼、石磨豆花等，场景壮观，亲情融融。',
      '长桌宴是苗族待客的最高礼仪，也是体验苗乡文化的重要方式。'
    ],
    stats: ['苗乡盛宴', '数百人同席', '待客礼仪']
  },

  beef: {
    category: '美食古蔺 · 更多风味',
    title: '毛条牛肉干',
    subtitle: '馥郁香浓 · 嚼劲十足',
           images: ['images/beef-jerky/beef-jerky1.webp', 
            'images/beef-jerky/beef-jerky2.webp', 
            'images/beef-jerky/beef-jerky3.webp'
],
    intro: '毛条牛肉干是古蔺传统小吃，牛肉干馥郁香浓，嚼劲十足。',
    content: [
      '采用传统工艺制作，保留牛肉的原汁原味，是古蔺人喜爱的休闲零食。',
      '适合作为旅游伴手礼，携带方便，保存时间长。'
    ],
    stats: ['传统小吃', '嚼劲十足', '旅游伴手礼']
  },

  

  /* 下半部分（非遗 8 个 + 标签云 8 个）见下一条消息 */
  
    /* ============================================================
     四、非遗传承 · 主卡片（8 个）
     ============================================================ */

  lantern: {
    category: '非遗传承',
    title: '古蔺花灯',
    subtitle: '国家级非遗 · 花灯之乡',
               images: ['images/gulin-lantern-1.webp', 
            'images/gulin-lantern-2.webp', 
            'images/gulin-lantern-3.webp', 
            'images/gulin-lantern-4.webp', 
            'images/gulin-lantern-5.webp'
],
    intro: '古蔺花灯是国家级非物质文化遗产，俗称“扭扭灯”，距今已有近千年历史，流行于赤水河中游地区。',
    content: [
      '表演具有“要逗要笑、要拽要闹、要唱要跳”的独特风格，充满诙谐、幽默、风趣的气氛，古蔺县因之被称为“花灯之乡”。',
      '每年正月初二至十八表演，是古蔺民间最重要的民俗活动之一。传承人姚占楷入选第六批国家级非遗代表性传承人。',
      '传承人谢建刚在抖音累计发布作品512个，总播放量超7000万次。春节期间太平古镇举办红色文化主题灯会，吸引游客12万人次。'
    ],
    stats: ['国家级非遗', '近千年历史', '短视频播放7000万', '春节游客12万']
  },

  caishanjie: {
    category: '非遗传承',
    title: '大寨宝佤踩山节',
    subtitle: '省级非遗 · 苗乡盛会',
               images: ['images/caishan-festival/caishan-festival1.webp', 
            'images/caishan-festival/caishan-festival2.webp', 
            'images/caishan-festival/caishan-festival3.webp', 
            'images/caishan-festival/caishan-festival4.webp', 
            'images/caishan-festival/caishan-festival5.webp'
],    intro: '大寨宝佤踩山节是四川省非物质文化遗产代表性项目，传承百年的传统节日。',
    content: [
      '踩山节是苗族最重要的传统节日之一，苗乡儿女身着盛装，载歌载舞，祭祀祖先，祈求丰收。',
      '2026年活动吸引约5万名游客来到苗乡，现场设置约100个摊位，集中展销特色美食、地方特产。',
      '踩山节已成为古蔺苗乡文化展示和农旅融合的重要平台。'
    ],
    stats: ['省级非遗', '传承百年', '2026年5万游客', '100个摊位']
  },

  

  batik: {
    category: '非遗传承',
    title: '苗族蜡染技艺',
    subtitle: '县级非遗 · 活态传承',
               images: ['images/batik/batik1.webp', 
            'images/batik/batik2.webp', 
            'images/batik/batik3.webp', 
            'images/batik/batik4.webp', 
            'images/batik/batik5.webp'
],  
    intro: '古蔺苗族蜡染技艺是古蔺县第四批非物质文化遗产代表性项目，箭竹苗族乡传承的苗族传统印染工艺。',
    content: [
      '设置“前店后坊”体验空间7处，通过“手工制作+沉浸式互动”实现活态传承。',
      '带动1000余人居家就业，蜡染、刺绣手工艺品畅销国内外。',
      '蜡染是苗族文化的重要载体，纹样多取材于自然与生活，色彩素雅，风格独特。'
    ],
    stats: ['县级非遗', '带动就业1000+', '7处体验空间', '畅销国内外']
  },

  embroidery: {
    category: '非遗传承',
    title: '苗族刺绣技艺',
    subtitle: '县级非遗 · 正申报市级',
               images: ['images/embroidery/embroidery1.webp', 
            'images/embroidery/embroidery2.webp', 
            'images/embroidery/embroidery3.webp', 
            'images/embroidery/embroidery4.webp', 
            'images/embroidery/embroidery5.webp'
],
    intro: '古蔺苗族刺绣技艺是古蔺县第四批非物质文化遗产代表性项目，苗族传统刺绣工艺。',
    content: [
      '纹样精美，色彩丰富，多用于苗族服饰、头饰、背扇等。',
      '正积极申报市级非遗名录。',
      '苗族刺绣与蜡染共同构成古蔺苗族服饰文化的核心。'
    ],
    stats: ['县级非遗', '纹样精美', '正申报市级']
  },

  lusheng: {
    category: '非遗传承',
    title: '芦笙制作技艺',
    subtitle: '县级非遗 · 苗乡记忆',
               images: ['images/lusheng/lusheng1.webp', 
            'images/lusheng/lusheng2.webp', 
            'images/lusheng/lusheng3.webp', 
            'images/lusheng/lusheng4.webp', 
            'images/lusheng/lusheng5.webp'
],
    intro: '古蔺芦笙制作技艺是古蔺县第五批非物质文化遗产代表性项目，苗族传统乐器制作技艺。',
    content: [
      '德耀镇燕岩村传承人古银书的芦笙制作技艺可追溯至清朝陶氏一脉。',
      '芦笙是苗族最重要的传统乐器之一，常用于节日、祭祀、婚嫁等场合。',
      '制作技艺包括选料、烘烤、打磨、调音等多道工序，讲究精细。'
    ],
    stats: ['县级非遗', '清朝传承', '苗乡乐器']
  },

  woodcarving: {
    category: '非遗传承',
    title: '黄荆根雕工艺',
    subtitle: '传统美术 · 依形就势',
   images: ['images/root-carving.webp', 
            'images/root-carving-2.webp', 
            'images/root-carving-3.webp', 
            'images/root-carving-4.webp', 
            'images/root-carving-5.webp'
],
    intro: '古蔺黄荆根雕工艺是传统美术类非物质文化遗产项目。',
    content: [
      '以黄荆老林中的天然树根为原料，依形就势，雕刻出人物、动物、山水等造型，古朴自然，独具匠心。',
      '黄荆老林是地球北纬28度线上唯一保存完好的亚热带原始常绿阔叶林，为根雕提供了丰富的天然素材。',
      '每一件根雕作品都是独一无二的艺术品。'
    ],
    stats: ['传统美术', '黄荆老林', '依形就势', '独一无二']
  },

 
};  // ← DETAIL_DATA 到此闭合


/* ---------- 详情页 ↔ 3D 模型映射（models/ 下对应的 PLY） ---------- */
const DETAIL_MODEL_MAP = {
  taiping:     'models/taiping-guzhen.ply',        // 太平古镇沙盘
  lake:        'models/guanwen-qianniaohu.ply',    // 千鸟湖沙盘
  daheidong:   'models/dahei-dong.ply',            // 大黑洞沙盘
  huangjing:   'models/huangjing-laolin.ply',      // 黄荆老林沙盘
  honglonghu:  'models/honglong-hu.ply',           // 红龙湖沙盘
  shuangsha:   'models/shuangsha-huahai.ply',      // 双沙花海沙盘
  chicken:     'models/gulin-malaji.ply',          // 麻辣鸡
  noodle:      'models/gulin-shougongmian.ply',    // 手工面
  herb:        'models/ganhuangcao.ply',           // 赶黄草
  shibao:      'models/shibao-hongtang-yangrou.ply',
  wine:        'models/langjiu.ply',
  orange:      'models/gulin-tiancheng.ply',
  lantern:     'models/gulin-huadeng.ply',
  caishanjie:  'models/caishan-jiegu.ply',
  batik:       'models/miaozu-laran.ply',
  embroidery:  'models/miaozu-cixiu.ply',
  lusheng:     'models/lusheng.ply',
  woodcarving: 'models/huangjing-gendiao.ply',
};


/* ---------- 渲染逻辑 ---------- */
(function renderDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const data = DETAIL_DATA[id];

  const loading = document.getElementById('detailLoading');
  const wrap = document.getElementById('detailWrap');

  if (!data) {
    loading.innerHTML = '<div style="text-align:center;color:#d4a843;font-size:1rem;">未找到该内容<br><br><a href="/" style="color:#f5d78e;">← 返回主页</a></div>';
    return;
  }

  // 兼容旧的单图字段
  const images = data.images || (data.image ? [data.image] : []);

  // 填充文字
  document.getElementById('detailCategory').textContent = data.category;
  document.getElementById('detailTitle').textContent = data.title;
  document.getElementById('detailSubtitle').textContent = data.subtitle;
  document.getElementById('detailIntro').textContent = data.intro;

  // 正文段落
  const contentEl = document.getElementById('detailContent');
  contentEl.innerHTML = data.content.map(p => `<p>${p}</p>`).join('');

  // 数据标签
  const statsEl = document.getElementById('detailStats');
  statsEl.innerHTML = data.stats.map(s => `<span class="detail-stat">${s}</span>`).join('');

  // 初始化轮播
  initCarousel(images);

  // 显示
  loading.style.display = 'none';
  wrap.style.display = 'block';

  // 3D 模型查看器（有对应模型才渲染；需在容器显示后初始化，否则宽度为 0）
  const modelUrl = data.model || DETAIL_MODEL_MAP[id];
  if (modelUrl) initModelViewer(modelUrl);

  document.title = data.title + ' | 重走长征路 · 古蔺';
})();

/* ---------- 轮播逻辑 ---------- */
/* ---------- 轮播逻辑（含灯箱） ---------- */
function initCarousel(images) {
  const track = document.getElementById('carouselTrack');
  const dotsWrap = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const carousel = document.getElementById('detailCarousel');

  if (!track || !images.length) return;

  // 生成所有图片
  track.innerHTML = images.map((src, i) => `
    <div class="carousel-slide">
      <img src="${src}" alt="图片 ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}" data-index="${i}">
    </div>
  `).join('');

  // 单张图：隐藏箭头和圆点，但仍可点击看大图
  if (images.length <= 1) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (dotsWrap) dotsWrap.style.display = 'none';
  } else {
    // 生成圆点
    dotsWrap.innerHTML = images.map((_, i) =>
      `<span class="carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`
    ).join('');

    const dots = dotsWrap.querySelectorAll('.carousel-dot');
    let current = 0;
    let autoTimer = null;

    function goTo(index) {
      current = (index + images.length) % images.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    // 箭头
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); next(); resetAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prev(); resetAuto(); });

    // 圆点
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        goTo(parseInt(dot.dataset.index, 10));
        resetAuto();
      });
    });

    // 触摸滑动
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let moved = false;

    carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
      moved = false;
    }, { passive: true });

    carousel.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        isDragging = false;
        moved = true;
        if (dx > 0) prev(); else next();
        resetAuto();
      }
    }, { passive: true });

    carousel.addEventListener('touchend', () => {
      isDragging = false;
    });

    // 自动轮播
    function startAuto() {
      autoTimer = setInterval(next, 5000);
    }
    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
    carousel.addEventListener('mouseleave', startAuto);

    startAuto();
  }

  // 点击图片打开灯箱
  track.querySelectorAll('.carousel-slide img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(img.dataset.index, 10);
      openLightbox(images, index);
    });
  });
}

/* ---------- 灯箱 ---------- */
let lightboxImages = [];
let lightboxIndex = 0;

function openLightbox(images, startIndex) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  lightboxImages = images;
  lightboxIndex = startIndex;

  updateLightbox();
  lightbox.classList.add('show');
  document.body.style.overflow = 'hidden'; // 禁止背景滚动
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  lightbox.classList.remove('show');
  document.body.style.overflow = '';
}

function updateLightbox() {
  const img = document.getElementById('lightboxImage');
  const counter = document.getElementById('lightboxCounter');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  if (!img) return;

  img.src = lightboxImages[lightboxIndex];
  img.alt = `图片 ${lightboxIndex + 1}`;
  counter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;

  // 单张图隐藏箭头
  if (lightboxImages.length <= 1) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (counter) counter.style.display = 'none';
  } else {
    if (prevBtn) prevBtn.style.display = '';
    if (nextBtn) nextBtn.style.display = '';
    if (counter) counter.style.display = '';
  }
}

/* ---------- 灯箱事件绑定 ---------- */
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  const overlay = lightbox.querySelector('.lightbox-overlay');

  function prevImage() {
    lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    updateLightbox();
  }

  function nextImage() {
    lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
    updateLightbox();
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (overlay) overlay.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });

  // 键盘控制
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('show')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  // 触摸滑动
  let startX = 0;
  let startY = 0;
  let isDragging = false;

  lightbox.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = true;
  }, { passive: true });

  lightbox.addEventListener('touchmove', (e) => {
    if (!isDragging || lightboxImages.length <= 1) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
      isDragging = false;
      if (dx > 0) prevImage(); else nextImage();
    }
  }, { passive: true });

  lightbox.addEventListener('touchend', () => {
    isDragging = false;
  });
})();

/* ==================== 详情页背景音乐 ==================== */
(function initDetailMusic() {
  const bgMusic = document.getElementById('bgMusic');
  if (!bgMusic) return;

  // 从 sessionStorage 读取播放位置和状态
  const musicTime = parseFloat(sessionStorage.getItem('music_time') || '0');
  const musicWasPlaying = sessionStorage.getItem('music_playing') === 'true';

  // 恢复播放位置和音量
  bgMusic.currentTime = musicTime;
  bgMusic.volume = 0.35;

  // 尝试自动播放（用户刚点击过卡片，浏览器会允许）
  if (musicWasPlaying !== false) {
    bgMusic.play().catch(err => {
      console.warn('详情页音乐自动播放被阻止：', err);
    });
  }

  // 用户点击详情页任意位置时，确保音乐在播放
  document.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play().catch(() => {});
    }
  }, { once: true });

  // 离开详情页前，保存当前播放位置和状态
  window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('music_time', bgMusic.currentTime);
    sessionStorage.setItem('music_playing', !bgMusic.paused);
  });

  // 页面隐藏（切后台）也保存
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      sessionStorage.setItem('music_time', bgMusic.currentTime);
      sessionStorage.setItem('music_playing', !bgMusic.paused);
    }
  });
})();

/* ==================== 3D 模型查看器 ==================== */
function initModelViewer(modelUrl) {
  const carousel = document.getElementById('detailCarousel');
  if (!carousel || !window.THREE || !THREE.PLYLoader || !THREE.OrbitControls) return;

  // 注入样式（幂等）
  if (!document.getElementById('detail3dStyle')) {
    const st = document.createElement('style');
    st.id = 'detail3dStyle';
    st.textContent = `
      .detail-3d { position: relative; margin: 18px 0 24px; border-radius: 14px; overflow: hidden;
        background: radial-gradient(120% 140% at 50% 0%, rgba(90,60,30,.45), rgba(16,9,5,.9));
        border: 1px solid rgba(212,168,67,.35); }
      .detail-3d-canvas { width: 100%; height: 380px; cursor: grab; }
      .detail-3d-canvas:active { cursor: grabbing; }
      .detail-3d-tip { position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%);
        font-size: 12px; letter-spacing: 2px; color: rgba(245,215,142,.7); pointer-events: none; white-space: nowrap; }
      @media (max-width: 768px) { .detail-3d-canvas { height: 260px; } }`;
    document.head.appendChild(st);
  }

  // 插入到轮播上方
  const box = document.createElement('div');
  box.className = 'detail-3d';
  box.innerHTML = `
    <div class="detail-3d-canvas"></div>
    <div class="detail-3d-tip">3D 模型 · 拖拽旋转 · 滚轮缩放</div>`;
  carousel.parentNode.insertBefore(box, carousel);
  const holder = box.querySelector('.detail-3d-canvas');
  const H = () => holder.clientHeight || 380;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, holder.clientWidth / H(), 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(holder.clientWidth, H());
  holder.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const keyLight = new THREE.DirectionalLight(0xfff2d9, 0.9);
  keyLight.position.set(3, 5, 4); scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xbcd4ff, 0.35);
  fillLight.position.set(-4, 2, -3); scene.add(fillLight);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true;          // 自动旋转，用户拖拽时自动暂停
  controls.autoRotateSpeed = 2.2;

  new THREE.PLYLoader().load(modelUrl, geo => {
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: 0.55, metalness: 0.08, side: THREE.DoubleSide
    }));

    // 居中并自适应取景
    geo.computeBoundingBox();
    const size = new THREE.Vector3(), center = new THREE.Vector3();
    geo.boundingBox.getSize(size);
    geo.boundingBox.getCenter(center);
    mesh.position.sub(center);
    scene.add(mesh);

    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.set(0, size.y * 0.3 + maxDim * 0.5, maxDim * 1.4);
    controls.target.set(0, 0, 0);
    controls.update();

    (function loop() {
      requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene, camera);
    })();
  }, undefined, () => {
    console.warn('3D 模型加载失败：', modelUrl);
    box.remove();                       // 失败则整个区块回退移除，不影响图文
  });

  window.addEventListener('resize', () => {
    camera.aspect = holder.clientWidth / H();
    camera.updateProjectionMatrix();
    renderer.setSize(holder.clientWidth, H());
  });
}