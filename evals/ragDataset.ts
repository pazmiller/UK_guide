export const LANGSMITH_RAG_DATASET_NAME = 'uk-website-rag-v1';

export type RagEvaluationCase = {
  id: string;
  question: string;
  referenceAnswer: string;
  expectedSourceTitles: string[];
  scenario: string;
};

export const RAG_EVALUATION_CASES: RagEvaluationCase[] = [
  {
    id: 'london-malaysian-restaurant',
    question: '伦敦 Med Salleh Kopitiam 有哪些推荐菜，价位大概多少？',
    referenceAnswer: '应推荐 Med Salleh Kopitiam，并说明可考虑 Chicken Rice、Nasi Lemak、Roti Canai，价位约 £25+/人。',
    expectedSourceTitles: [ 'Med Salleh Kopitiam' ],
    scenario: '伦敦餐厅与菜品、价位',
  },
  {
    id: 'london-neapolitan-pizza',
    question: 'Vasiniko 披萨值得去吗？有什么推荐？',
    referenceAnswer: '应说Vasiniko🍕值得去，说明其为非常正宗的那不勒斯披萨，并可提及 Margherita、Diavola、Espresso、Tiramisu 或 Pistacchiella。',
    expectedSourceTitles: [ 'Vasiniko🍕' ],
    scenario: '伦敦披萨推荐',
  },
  {
    id: 'london-horizon-22',
    question: 'Horizon 22 要钱吗，需要预约吗？',
    referenceAnswer: '应说明 Horizon 22 免费，但需要预约。',
    expectedSourceTitles: [ 'Horizon 22' ],
    scenario: '伦敦免费景点',
  },
  {
    id: 'london-sky-garden',
    question: 'Sky Garden 是免费景点吗？需要预约吗？',
    referenceAnswer: '应说明 Sky Garden 免费，需要预约。',
    expectedSourceTitles: [ 'Sky Garden' ],
    scenario: '伦敦免费景点',
  },
  {
    id: 'london-westminster-abbey',
    question: '伦敦 Westminster Abbey 值得去吗？',
    referenceAnswer: '应识别 Westminster Abbey 为伦敦景点，并只根据知识库提供的信息回答。',
    expectedSourceTitles: [ 'Westminster Abbey' ],
    scenario: '伦敦历史景点',
  },
  {
    id: 'london-arome-bakery',
    question: 'Arôme Bakery 有什么必点，咖啡怎么样？',
    referenceAnswer: '应推荐 Honey Butter Toast必点，咖啡提到Cortado好，可以提honey butter toast £5+也可以不提。',
    expectedSourceTitles: [ 'Arôme Bakery' ],
    scenario: '伦敦烘焙与咖啡',
  },
  {
    id: 'london-truedan-bubble-tea',
    question: '伦敦 Truedan 珍奶有什么推荐？',
    referenceAnswer: '应推荐四季春鲜奶茶或四季春奶茶，通常约 £4+。',
    expectedSourceTitles: [ 'Truedan' ],
    scenario: '伦敦饮品',
  },
  {
    id: 'uk-greggs-budget',
    question: 'Greggs 有什么适合省钱解决一餐的选择？',
    referenceAnswer: '应说明 Greggs 是英国连锁烘焙快餐，可提到 meal deal（披萨加饮品）与可能存在的晚间优惠，并保留信息可能变化的限定。',
    expectedSourceTitles: [ 'Greggs' ],
    scenario: '英国平价快餐',
  },
  {
    id: 'london-bella-italia-avoid',
    question: '伦敦 Bella Italia 值得去吗？',
    referenceAnswer: '应作为避雷项说明：它是连锁意大利餐厅，知识库认为菜品平庸，不应包装成推荐。',
    expectedSourceTitles: [ 'Bella Italia' ],
    scenario: '伦敦避雷餐厅',
  },
  {
    id: 'glasgow-non-viet',
    question: '格拉斯哥 Non Viet 有什么推荐？',
    referenceAnswer: '应推荐 Pho 和夏卷，并说明是越南菜。',
    expectedSourceTitles: [ 'Non Viet' ],
    scenario: '格拉斯哥越南菜',
  },
  {
    id: 'glasgow-fish-and-chips',
    question: '格拉斯哥 Largus 海边 Fish & Chips 好吃吗？',
    referenceAnswer: '应推荐 Largus 海边 Fish & Chips，并说明知识库的推荐菜为 Fish & Chips。',
    expectedSourceTitles: [ 'Largus 海边 Fish & Chips' ],
    scenario: '格拉斯哥海边餐厅',
  },
  {
    id: 'southampton-new-panda',
    question: '南安普顿 New Panda 熊记 有什么推荐菜？',
    referenceAnswer: '应推荐辣子鸡，并可提及邮编 SO15 2DB。',
    expectedSourceTitles: [ 'New Panda 熊记' ],
    scenario: '南安普顿中餐',
  },
  {
    id: 'edinburgh-la-sal',
    question: '爱丁堡 La Sal 的海鲜饭值得点吗，价位如何？',
    referenceAnswer: '应推荐 De Marisco Paella，并可提及 Calamares、Padron Peppers，价位约 £30/人。',
    expectedSourceTitles: [ 'La Sal' ],
    scenario: '爱丁堡西班牙菜',
  },
  {
    id: 'york-bettys-afternoon-tea',
    question: '约克 Bettys Café Tea Rooms 的下午茶怎么样，要排队吗？',
    referenceAnswer: '应说明这是经典英式茶屋，推荐经典下午茶三层塔；walk-in 通常需要排队，价位约 £20–35/人。',
    expectedSourceTitles: [ 'Bettys Café Tea Rooms' ],
    scenario: '约克下午茶',
  },
  {
    id: 'york-ippuku-tea-house',
    question: '约克 Ippuku Tea House 有什么日式餐点或茶推荐？',
    referenceAnswer: '应推荐玉露等日本茶、时令 special 或手工咖喱，并说明是日式家庭小馆。',
    expectedSourceTitles: [ 'Ippuku Tea House' ],
    scenario: '约克日式餐厅',
  },
  {
    id: 'iceland-skal',
    question: '雷克雅未克 Skál! 有什么招牌菜，预算多少？',
    referenceAnswer: '应推荐羊肩肉，也可提及鲟鱼子酱配面包或传统鱼肉拌土豆泥；价位为 8000–12000 冰岛克朗/人。',
    expectedSourceTitles: [ 'Skál!' ],
    scenario: '冰岛餐厅',
  },
  {
    id: 'poland-pierogarnia-mandu',
    question: '格但斯克 Pierogarnia Mandu 有哪些波兰饺子值得吃？',
    referenceAnswer: '应推荐蓝莓饺子、巧克力炸香蕉饺子或传统饺子，并说明人均约 50 PLN。',
    expectedSourceTitles: [ 'Pierogarnia Mandu Gdańsk Śródmieście' ],
    scenario: '格但斯克波兰菜',
  },
  {
    id: 'stockholm-kajsas-fisk',
    question: '斯德哥尔摩 Kajsas Fisk 的鱼汤怎么样？',
    referenceAnswer: '应推荐招牌鱼汤和北极虾沙拉，并说明人均约 150 SEK。',
    expectedSourceTitles: [ 'Kajsas Fisk' ],
    scenario: '斯德哥尔摩瑞典菜',
  },
  {
    id: 'copenhagen-det-lille-apotek',
    question: '哥本哈根 Det Lille Apotek 想吃传统丹麦菜，有什么推荐？',
    referenceAnswer: '应推荐炸猪五花肉、烤猪颈肉或烤鸭，并说明价位约 200–300 DKK/人。',
    expectedSourceTitles: [ 'Det Lille Apotek' ],
    scenario: '哥本哈根丹麦菜',
  },
  {
    id: 'paris-la-tour-montlhery',
    question: '巴黎 La Tour Montlhéry 是什么类型的餐厅，位置大概在哪里？',
    referenceAnswer: '应说明它提供经典地道的巴黎法国菜与牛排，位于卢浮宫附近、靠近 Châtelet 换乘站。',
    expectedSourceTitles: [ 'La Tour Montlhéry' ],
    scenario: '巴黎法国菜',
  },
];
