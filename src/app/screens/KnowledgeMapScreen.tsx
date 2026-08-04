import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ArrowLeft, X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type Status = 'mastered' | 'learning' | 'review_due' | 'new' | 'weak';
type Filter = 'all' | 'today' | 'review' | 'weak' | 'mastered';
type ViewMode = 'star' | 'mindmap' | 'list';
type PlanMembership = 'included' | 'excluded';

interface Concept {
  id: string; name: string; status: Status;
  x: number; y: number; deg: number;
  sectionId: string; chapterId: string;
  membership: PlanMembership;
  sx: number; sy: number; // group-local SVG coords
}

// ── Canvas constants ──────────────────────────────────────────────────────────

const SVG_W = 1000, SVG_H = 580, CX = 500, CY = 290;
const SX = 920, SY = 540; // spread factors

const csx = (x: number) => (x - 0.5) * SX;
const csy = (y: number) => (y - 0.5) * SY;

// ── LCG dust stars ────────────────────────────────────────────────────────────

function lcgRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}
const DUST = (() => {
  const rng = lcgRng(9973);
  return Array.from({ length: 440 }, () => ({
    x: rng() * SVG_W, y: rng() * SVG_H,
    r: rng() * 0.85 + 0.2,
    op: rng() * 0.14 + 0.04,
  }));
})();

// ── Static data ───────────────────────────────────────────────────────────────

const S_CH: Record<string, string> = {
  ch1s1:'ch1',ch1s2:'ch1',ch1s3:'ch1',ch1s4:'ch1',ch1s5:'ch1',ch1s6:'ch1',ch1s7:'ch1',
  ch2s1:'ch2',ch2s2:'ch2',ch2s3:'ch2',ch2s4:'ch2',ch2s5:'ch2',ch2s6:'ch2',ch2s7:'ch2',
};
const SECTIONS = [
  { id:'ch1s1', chId:'ch1', name:'司法解释斡旋受贿', cx:0.58, cy:0.39 },
  { id:'ch1s2', chId:'ch1', name:'中间人与罪数模型', cx:0.84, cy:0.70 },
  { id:'ch1s3', chId:'ch1', name:'斡旋受贿与利用影响力', cx:0.37, cy:0.34 },
  { id:'ch1s4', chId:'ch1', name:'渎职罪名与受贿关系', cx:0.54, cy:0.30 },
  { id:'ch1s5', chId:'ch1', name:'受贿与其他犯罪', cx:0.62, cy:0.43 },
  { id:'ch1s6', chId:'ch1', name:'行贿罪构成与罪数', cx:0.67, cy:0.49 },
  { id:'ch1s7', chId:'ch1', name:'受贿罪构成与既遂', cx:0.59, cy:0.41 },
  { id:'ch2s1', chId:'ch2', name:'犯罪客体与刑法机能', cx:0.46, cy:0.66 },
  { id:'ch2s2', chId:'ch2', name:'犯罪主体与单位犯罪', cx:0.40, cy:0.46 },
  { id:'ch2s3', chId:'ch2', name:'因果关系与结果加重', cx:0.42, cy:0.57 },
  { id:'ch2s4', chId:'ch2', name:'主观要件与认识错误', cx:0.54, cy:0.66 },
  { id:'ch2s5', chId:'ch2', name:'刑法解释方法与技巧', cx:0.35, cy:0.74 },
  { id:'ch2s6', chId:'ch2', name:'犯罪构成与定罪方法', cx:0.40, cy:0.62 },
  { id:'ch2s7', chId:'ch2', name:'刑法基本原则与技巧', cx:0.43, cy:0.65 },
] as const;
const CHAPTERS = [
  { id:'ch1', name:'刑法分论', cx:0.58, cy:0.40 },
  { id:'ch2', name:'刑法总论', cx:0.41, cy:0.63 },
] as const;

// [name, status, x, y, deg, sectionId]
type CRow = [string, Status, number, number, number, string];

const RAW: CRow[] = [
  // ── ch1s1 ──
  ['什么是变相受贿行为？请结合常见形','mastered',0.3436,0.2688,3,'ch1s1'],
  ['以交易形式变相受贿时，计算受贿数','mastered',0.4621,0.4367,3,'ch1s1'],
  ['干股作为变相受贿表现为何？其应如','mastered',0.5291,0.3298,3,'ch1s1'],
  ['以委托理财名义收受贿赂，如何认定','mastered',0.5247,0.3773,3,'ch1s1'],
  ['在司法解释中，哪些行为被明确界定','mastered',0.4458,0.8025,3,'ch1s1'],
  ['解释什么情况下国家工作人员收受财','review_due',0.569,0.1295,3,'ch1s1'],
  ['国家工作人员受贿后因掩盖犯罪行为','mastered',0.5808,0.1716,4,'ch1s1'],
  ['为什么及时退还收受的财物对受贿罪','mastered',0.6646,0.2948,3,'ch1s1'],
  ['国家工作人员未收受财物故意，但收','mastered',0.6522,0.1334,4,'ch1s1'],
  ['受贿罪中主观故意的含义及其在及时','review_due',0.6138,0.583,3,'ch1s1'],
  ['为什么离职后收钱原则上不构成受贿','mastered',0.6447,0.4631,3,'ch1s1'],
  ['离职后收钱为什么不能认定为受贿罪','learning',0.6716,0.5381,4,'ch1s1'],
  ['以下哪种情形符合受贿罪既遂的标准','new',0.6607,0.6068,6,'ch1s1'],
  ['离职后收钱的情形中，哪种情况可能','new',0.6552,0.6696,5,'ch1s1'],
  ['离职后收钱不构成受贿罪的法律依据','learning',0.5148,0.5225,4,'ch1s1'],
  // ── ch1s2 ──
  ['解释中间人模型中受贿罪数额如何划','learning',0.9353,0.6397,6,'ch1s2'],
  ['在中间人模型中，乙收受100万元','mastered',0.98,0.6729,6,'ch1s2'],
  ['比较斡旋受贿罪与利用影响力受贿罪','new',0.348,0.3849,5,'ch1s2'],
  ['中间人模型中甲、乙、丙三人分别有','review_due',0.98,0.6582,3,'ch1s2'],
  ['利用影响力受贿罪成立的关键行为条','review_due',0.337,0.4057,3,'ch1s2'],
  ['中间人模型中，游说行为如何影响受','review_due',0.98,0.7483,6,'ch1s2'],
  ['请比较利用影响力受贿罪与斡旋受贿','new',0.2667,0.4114,4,'ch1s2'],
  ['在中间人模型二犯罪兼并中，乙收甲','mastered',0.9732,0.7085,5,'ch1s2'],
  ['游说与收钱行为在中间人模型二犯罪','mastered',0.98,0.707,3,'ch1s2'],
  ['中间人模型中，若乙收钱后未告知丙','mastered',0.98,0.7498,3,'ch1s2'],
  ['中间人模型中，乙隐瞒收钱，丙只猜','learning',0.9267,0.6983,9,'ch1s2'],
  ['在乙隐瞒收钱而丙猜测知情的情形下','new',0.7722,0.6775,3,'ch1s2'],
  ['中间人模型三共犯认定中，甲对乙和','new',0.98,0.7282,3,'ch1s2'],
  ['为什么乙隐瞒收钱而丙猜测知情时，','mastered',0.7244,0.641,3,'ch1s2'],
  ['中间人模型三共犯认定案件中，甲乙','new',0.98,0.6871,3,'ch1s2'],
  // ── ch1s3 ──
  ['斡旋受贿罪的行为主体是谁','mastered',0.3802,0.3125,7,'ch1s3'],
  ['为什么说斡旋受贿罪成立不要求实际','learning',0.4506,0.3516,3,'ch1s3'],
  ['斡旋受贿罪与普通受贿罪如何区分','review_due',0.4794,0.4112,7,'ch1s3'],
  ['斡旋受贿罪中，受贿的利益必须具备','learning',0.464,0.303,4,'ch1s3'],
  ['斡旋受贿罪成立的关键条件是什么','mastered',0.3927,0.3964,5,'ch1s3'],
  ['利用影响力受贿罪的行为主体包括哪','new',0.2942,0.3926,5,'ch1s3'],
  ['为什么离职的国家工作人员及其近亲','weak',0.6339,0.2107,3,'ch1s3'],
  ['利用影响力受贿罪与普通受贿罪主体','review_due',0.3789,0.3731,10,'ch1s3'],
  ['利用影响力受贿罪中关系密切人定义','new',0.2684,0.3503,3,'ch1s3'],
  ['在利用影响力受贿罪中，终端办事人','mastered',0.2527,0.3116,4,'ch1s3'],
  ['什么是利用影响力受贿罪的行为方式','review_due',0.302,0.3594,5,'ch1s3'],
  ['利用影响力受贿罪行为主体掌握版','mastered',0.3023,0.4218,9,'ch1s3'],
  ['斡旋受贿与普通受贿的主要区分标准','review_due',0.441,0.4081,5,'ch1s3'],
  ['为何斡旋受贿罪不要求实际实施斡旋','weak',0.3843,0.2775,3,'ch1s3'],
  ['同级或下级找上级请求办事收财属于','mastered',0.3582,0.179,3,'ch1s3'],
  ['斡旋受贿与普通受贿的行为主体有何','mastered',0.3711,0.3384,5,'ch1s3'],
  ['上级找下级索贿属于哪种受贿行为','learning',0.3749,0.2307,4,'ch1s3'],
  ['斡旋受贿行为中请托人与受贿者的关','new',0.3126,0.2826,3,'ch1s3'],
  // ── ch1s4 ──
  ['滥用职权罪与玩忽职守罪的本质区别','learning',0.6687,0.3635,4,'ch1s4'],
  ['举例说明滥用职权罪中的不作为行为','mastered',0.5557,0.3861,4,'ch1s4'],
  ['玩忽职守罪在主观上体现为何种过失','mastered',0.5829,0.3659,4,'ch1s4'],
  ['滥用职权罪与玩忽职守罪的处罚区别','new',0.619,0.3597,4,'ch1s4'],
  ['滥用职权罪和玩忽职守罪如何区分责','mastered',0.6257,0.4473,5,'ch1s4'],
  ['徇私枉法罪的犯罪主体是谁','review_due',0.5019,0.3097,8,'ch1s4'],
  ['徇私枉法罪的表现形式有哪些','mastered',0.4434,0.3799,4,'ch1s4'],
  ['为什么徇私枉法罪要求犯罪主体具有','review_due',0.5108,0.2836,4,'ch1s4'],
  ['徇私枉法罪中司法工作人员的主要违','new',0.494,0.2067,3,'ch1s4'],
  ['徇私枉法罪与受贿罪的刑罚处理上有','mastered',0.5511,0.351,5,'ch1s4'],
  ['司法工作人员同时构成受贿罪与徇私','mastered',0.5781,0.2707,4,'ch1s4'],
  ['为什么司法工作人员受贿并枉法以重','review_due',0.4836,0.267,3,'ch1s4'],
  ['受贿罪与司法渎职罪在罪数处理上有','learning',0.6541,0.4245,3,'ch1s4'],
  ['司法工作人员受贿并枉法，适用何种','mastered',0.52,0.1716,3,'ch1s4'],
  ['受贿罪加徇私枉法罪属于哪种犯罪关','new',0.4325,0.2893,5,'ch1s4'],
  ['什么是私放等一般渎职罪名，涉及哪','weak',0.5458,0.416,3,'ch1s4'],
  ['私放在押人员罪与失职致使在押人员','new',0.5195,0.1249,3,'ch1s4'],
  ['徇私舞弊不移交刑事案件罪的主体和','mastered',0.4965,0.3436,3,'ch1s4'],
  ['帮助犯罪分子逃避处罚罪的犯罪行为','learning',0.5708,0.411,3,'ch1s4'],
  ['不解救被拐卖、绑架妇女、儿童罪的','new',0.02,0.02,0,'ch1s4'],
  // ── ch1s5 ──
  ['受贿罪与渎职罪一般如何适用罪数关','mastered',0.7115,0.4639,4,'ch1s5'],
  ['为什么受贿罪与徇私枉法罪等四罪属','weak',0.5224,0.2388,5,'ch1s5'],
  ['受贿罪与渎职罪数罪并罚时，如何确','new',0.6471,0.5156,8,'ch1s5'],
  ['举例说明受贿罪与渎职罪数罪并罚的','new',0.6566,0.4936,8,'ch1s5'],
  ['受贿罪与渎职罪数罪并罚的意义是什','mastered',0.7541,0.4794,4,'ch1s5'],
  ['受贿罪与贪污罪的主要区别是什么','mastered',0.6069,0.3971,4,'ch1s5'],
  ['为什么受贿罪与贪污罪属于竞合关系','mastered',0.5423,0.29,4,'ch1s5'],
  ['受贿罪与贪污罪的财物来源有什么显','new',0.6948,0.3283,4,'ch1s5'],
  ['以下关于受贿罪与贪污罪的关系描述','mastered',0.63,0.4175,4,'ch1s5'],
  ['如果国家工作人员使用公共财物擅自','new',0.622,0.2572,3,'ch1s5'],
  ['为什么受贿罪的既遂数额以犯罪当时','mastered',0.6405,0.3896,5,'ch1s5'],
  ['受贿罪既遂的数额认定为何不包括后','new',0.6806,0.4498,3,'ch1s5'],
  ['受贿罪中犯罪时为准的数额认定','mastered',0.5007,0.3722,3,'ch1s5'],
  ['比较受贿罪既遂数额与犯罪所得的收','mastered',0.568,0.4439,3,'ch1s5'],
  ['受贿罪中如何确定共同受贿的数额','mastered',0.524,0.4926,4,'ch1s5'],
  ['受贿罪既遂数额应以什么时候的财物','review_due',0.7629,0.3772,5,'ch1s5'],
  ['受贿罪既遂数额是否包括犯罪后取得','weak',0.7353,0.3512,5,'ch1s5'],
  ['什么是共同受贿数额计算原则？为什','mastered',0.4953,0.5522,6,'ch1s5'],
  ['举例说明共同受贿数额的计算方式，','mastered',0.4959,0.4958,3,'ch1s5'],
  ['共同受贿数额计算原则的法律依据和','learning',0.4456,0.5913,5,'ch1s5'],
  ['为什么共同受贿中的受贿数额以整体','new',0.5143,0.4586,3,'ch1s5'],
  ['共同受贿数额原则中，如何处理受贿','mastered',0.5433,0.5705,8,'ch1s5'],
  // ── ch1s6 ──
  ['请解释行贿罪的构成要件包括哪些关','mastered',0.3685,0.5928,5,'ch1s6'],
  ['如何区分行贿罪与受贿罪的主体','review_due',0.5891,0.4786,9,'ch1s6'],
  ['下列哪项行为符合行贿罪的构成要件','learning',0.4768,0.5307,3,'ch1s6'],
  ['为什么行贿罪要求行为人有谋取不正','learning',0.623,0.3248,5,'ch1s6'],
  ['行贿罪的既遂标准是什么','mastered',0.6808,0.5824,6,'ch1s6'],
  ['行贿罪与受贿罪在数额认定上有什么','new',0.5989,0.4254,7,'ch1s6'],
  ['行贿罪既遂的标准是什么？请详细说','new',0.7112,0.5646,3,'ch1s6'],
  ['为什么行贿罪既遂不要求财物所有权','new',0.7109,0.4213,3,'ch1s6'],
  ['行贿罪既遂与受贿罪既遂在财物控制','weak',0.699,0.5005,7,'ch1s6'],
  ['以下哪种情况可以构成行贿罪既遂','review_due',0.7285,0.606,4,'ch1s6'],
  ['行贿罪既遂标准中的客观占有为何','learning',0.6483,0.6331,4,'ch1s6'],
  ['如何理解行贿罪与受贿罪的对向犯关','mastered',0.5637,0.542,4,'ch1s6'],
  ['为何被勒索给予财物未获不正当利益','review_due',0.7271,0.2836,3,'ch1s6'],
  ['在行贿罪与受贿罪关系中，怎样处理','new',0.6194,0.4854,4,'ch1s6'],
  ['行贿罪与受贿罪的数额如何对应','new',0.6794,0.4739,5,'ch1s6'],
  ['行贿与受贿罪中，有哪些例外情形不','weak',0.6016,0.5572,3,'ch1s6'],
  ['行贿罪的数罪并罚规则是怎样规定的','mastered',0.7467,0.558,3,'ch1s6'],
  ['为什么行贿人谋取的不正当利益犯罪','new',0.7194,0.3883,4,'ch1s6'],
  ['行贿罪与谋取利益的犯罪同时存在时','learning',0.6802,0.4046,3,'ch1s6'],
  ['行贿罪与谋取不正当利益的犯罪并罚','weak',0.7438,0.4383,3,'ch1s6'],
  ['行贿罪数罪并罚适用的案例体现了什','mastered',0.8037,0.5281,5,'ch1s6'],
  // ── ch1s7 ──
  ['为什么受贿罪的主体必须是国家工作','review_due',0.5932,0.3384,4,'ch1s7'],
  ['受贿罪中，国家工作人员必须具备什','learning',0.5534,0.1958,7,'ch1s7'],
  ['受贿罪主体要件为什么不能认定离职','review_due',0.5429,0.4439,4,'ch1s7'],
  ['受贿罪主体身份的认定，为什么仍需','mastered',0.5112,0.4127,4,'ch1s7'],
  ['以下哪种身份不符合作为受贿罪的主','mastered',0.6188,0.5106,3,'ch1s7'],
  ['什么是受贿罪中利用职务便利的含义','review_due',0.3366,0.3458,4,'ch1s7'],
  ['为什么受贿罪的行为要件特别强调职','mastered',0.425,0.3245,3,'ch1s7'],
  ['利用职务便利的受贿行为包括哪些具','mastered',0.3594,0.4384,3,'ch1s7'],
  ['利用职务便利行为要件与行贿行为的','new',0.3144,0.3257,5,'ch1s7'],
  ['受贿罪中利用职务便利行为的主体限','review_due',0.3414,0.3103,3,'ch1s7'],
  ['为什么受贿罪要求国家工作人员必须','new',0.5684,0.2249,10,'ch1s7'],
  ['受贿罪中，国家工作人员收受财物但','learning',0.5976,0.1984,13,'ch1s7'],
  ['受贿罪成立的主观故意包含哪些要素','learning',0.4146,0.5318,5,'ch1s7'],
  ['受贿罪的既遂标准如何确定','new',0.6498,0.5807,5,'ch1s7'],
  ['国家工作人员收受财物但无主观受贿','mastered',0.6143,0.1758,5,'ch1s7'],
  ['关于受贿罪的主观故意，下列哪些说','learning',0.5553,0.608,5,'ch1s7'],
  ['受贿罪既遂的标准是什么？为什么不','new',0.6288,0.5489,7,'ch1s7'],
  ['为什么受贿罪中的取得控制财物比取','mastered',0.6567,0.3304,4,'ch1s7'],
  ['受贿罪中如何判断定期存款是否既遂','mastered',0.5732,0.5161,3,'ch1s7'],
  ['下列哪种情形不影响受贿罪既遂的认','learning',0.6914,0.6165,4,'ch1s7'],
  ['受贿罪既遂标准中，主体必须是什么','learning',0.7286,0.5141,4,'ch1s7'],
  ['国家工作人员取得财物是否必须完成','mastered',0.6782,0.2126,4,'ch1s7'],
  ['为什么受贿罪既遂后财物被取回或用','mastered',0.754,0.4107,4,'ch1s7'],
  ['受贿罪既遂后的处理原则有哪些具体','new',0.5567,0.4768,3,'ch1s7'],
  ['受贿罪既遂与未遂的关键区别是什么','mastered',0.5949,0.4569,3,'ch1s7'],
  ['受贿罪既遂后，行贿人取回财物是否','learning',0.695,0.3668,5,'ch1s7'],
  ['收受转账支票但未提取现金对受贿罪','learning',0.4695,0.2319,3,'ch1s7'],
  // ── ch2s1 ──
  ['犯罪客体的概念及其在犯罪构成中的','mastered',0.5077,0.6708,4,'ch2s1'],
  ['如何区分犯罪对象与犯罪客体','new',0.5152,0.5617,4,'ch2s1'],
  ['犯罪客体在犯罪构成要件中的功能体','learning',0.4189,0.6626,5,'ch2s1'],
  ['为什么理解犯罪客体对刑法实务和考','review_due',0.4243,0.7004,3,'ch2s1'],
  ['刑法保护法益时，为什么要优先保障','new',0.4972,0.6338,5,'ch2s1'],
  ['请比较刑法保护社会利益与约束国家','new',0.3393,0.6016,3,'ch2s1'],
  ['刑法保护法益的核心目的是什么','mastered',0.4843,0.7354,5,'ch2s1'],
  ['刑法中有哪些机制体现对国家权力的','learning',0.3813,0.5552,3,'ch2s1'],
  ['当刑法保护的社会利益与人权发生冲','mastered',0.5461,0.5088,3,'ch2s1'],
  // ── ch2s2 ──
  ['为什么身份犯要求特定身份才能构成','mastered',0.5638,0.3233,3,'ch2s2'],
  ['如何以国家工作人员的身份标准来认','review_due',0.6069,0.1331,3,'ch2s2'],
  ['自然人身份犯与普通刑事犯罪的根本','mastered',0.4906,0.4491,3,'ch2s2'],
  ['以下哪些情形符合自然人身份犯的主','weak',0.575,0.5778,5,'ch2s2'],
  ['为什么国家工作人员只有在以公务为','new',0.5845,0.1025,3,'ch2s2'],
  ['什么是单位犯罪中的纯正单位犯罪和','weak',0.3919,0.4417,7,'ch2s2'],
  ['单位犯罪成立的条件有哪些？为什么','mastered',0.3385,0.4639,6,'ch2s2'],
  ['如何综合判断单位的法人资格与单位','mastered',0.3569,0.5011,4,'ch2s2'],
  ['单位犯罪中，法人资格缺失时会产生','new',0.2623,0.4682,3,'ch2s2'],
  ['单位犯罪与个人犯罪在责任归属上有','new',0.4181,0.4701,3,'ch2s2'],
  ['解释双罚制原则在单位犯罪处罚中的','mastered',0.3756,0.471,3,'ch2s2'],
  ['单位消亡后，如何追究责任人的刑事','mastered',0.4748,0.4747,3,'ch2s2'],
  ['单位犯罪责任分配中，为什么需要处','weak',0.3253,0.5223,5,'ch2s2'],
  ['根据双罚制，单位消亡后，处罚主要','new',0.4702,0.3841,3,'ch2s2'],
  ['单位犯罪处罚与一般犯罪处罚有何区','review_due',0.4242,0.4393,4,'ch2s2'],
  // ── ch2s3 ──
  ['如何定义刑法中因果关系','mastered',0.2752,0.5429,6,'ch2s3'],
  ['刑法因果关系成立需要满足哪些基本','new',0.2362,0.5211,3,'ch2s3'],
  ['为什么刑法中因果关系不认定仅凭时','mastered',0.2619,0.6269,5,'ch2s3'],
  ['举例说明因果关系中邻接性与关联性','mastered',0.3905,0.5087,3,'ch2s3'],
  ['刑法因果关系中如何处理复杂的多因','weak',0.3644,0.5403,5,'ch2s3'],
  ['介入因素两步走判断标准如何帮助判','weak',0.581,0.682,4,'ch2s3'],
  ['为什么要通过作用大小来判断介入因','mastered',0.512,0.7653,5,'ch2s3'],
  ['介入因素两步走判断标准包括哪些主','mastered',0.4632,0.7157,5,'ch2s3'],
  ['如果介入行为不异常，则如何处理其','learning',0.5216,0.6024,3,'ch2s3'],
  ['介入因素两步走判断标准在司法实践','review_due',0.5511,0.7902,4,'ch2s3'],
  ['什么是结果加重犯结构中的基本组成','mastered',0.2939,0.481,4,'ch2s3'],
  ['结果加重犯结构中为何必须具备因果','mastered',0.4069,0.3613,3,'ch2s3'],
  ['哪个选项正确描述了结果加重犯的构','review_due',0.457,0.5014,3,'ch2s3'],
  ['结果加重犯结构中的因果关系如何判','learning',0.324,0.4958,5,'ch2s3'],
  ['案例分析：嫖客用假币支付嫖资情形','new',0.95,0.546,2,'ch2s3'],
  ['案例中，乙谎称销赃款数额分给甲，','mastered',0.8461,0.6277,4,'ch2s3'],
  // ── ch2s4 ──
  ['犯罪故意中的认识与意志因素是如何','learning',0.6467,0.737,3,'ch2s4'],
  ['犯罪故意与主客观一致原则为何重要','review_due',0.6159,0.797,3,'ch2s4'],
  ['行为时主观认识与客观事实不一致会','review_due',0.6099,0.6985,3,'ch2s4'],
  ['下列哪项最准确地描述犯罪故意的构','mastered',0.6115,0.6639,3,'ch2s4'],
  ["犯罪故意的行为时同时存在原则",'learning',0.6905,0.6731,5,'ch2s4'],
  ["解释犯罪故意中的认识因素与意志",'mastered',0.5933,0.7491,3,'ch2s4'],
  ['请解释直接故意和间接故意在犯罪主','new',0.4911,0.6971,4,'ch2s4'],
  ['请说明过失包括哪些主要形态及其区','learning',0.4143,0.605,3,'ch2s4'],
  ['如何区分直接故意、间接故意与过失','weak',0.5914,0.6212,4,'ch2s4'],
  ['犯罪中的直接故意行为特征','new',0.5957,0.5321,6,'ch2s4'],
  ['间接故意在犯罪心理态度上有何特点','weak',0.4648,0.611,3,'ch2s4'],
  ['行为人因过于自信而导致犯罪，属于','review_due',0.4703,0.3347,3,'ch2s4'],
  ['请解释对象错误中的具体错误与抽象','new',0.3116,0.6772,3,'ch2s4'],
  ['为什么对象错误属于具体认识错误中','learning',0.4252,0.5006,3,'ch2s4'],
  ['请说明法定符合说对认定故意犯罪的','mastered',0.5533,0.6683,3,'ch2s4'],
  ['对象错误和法律符合说在认识错误分','new',0.4564,0.6403,3,'ch2s4'],
  // ── ch2s5 ──
  ['刑法解释的对象具体包括哪些内容','learning',0.3234,0.6304,6,'ch2s5'],
  ['请比较立法解释、司法解释和学理解','review_due',0.3125,0.7608,5,'ch2s5'],
  ['为什么司法解释的效力次于立法解释','new',0.3725,0.6804,4,'ch2s5'],
  ['学理解释在刑法解释中有何作用及法','mastered',0.3618,0.7581,6,'ch2s5'],
  ['刑法解释技巧包括哪些分类？请简要','mastered',0.3164,0.7132,3,'ch2s5'],
  ['为什么类推解释在刑法中通常被禁止','new',0.2923,0.8016,3,'ch2s5'],
  ['如何理解刑法中的缩小解释？请举例','new',0.3445,0.6981,3,'ch2s5'],
  ['比较刑法中的扩大解释和平义解释，','mastered',0.2724,0.7526,4,'ch2s5'],
  ['关于刑法解释中的四种解释技巧，下','mastered',0.3604,0.784,3,'ch2s5'],
  ['刑法解释中的体系解释如何保证结论','mastered',0.3929,0.8014,5,'ch2s5'],
  ['当然解释在刑法解释中如何运用，为','learning',0.4127,0.7736,8,'ch2s5'],
  ['目的解释为何在刑法解释中至关重要','mastered',0.4072,0.8447,3,'ch2s5'],
  ['刑法解释理由的体系解释当然解释等','mastered',0.3253,0.8081,5,'ch2s5'],
  ['侮辱在强制猥亵罪与侮辱罪中的含义','learning',0.5941,0.3002,3,'ch2s5'],
  ['在刑法解释中，为何要求举轻明重和','learning',0.3659,0.8295,3,'ch2s5'],
  // ── ch2s6 ──
  ['请解释犯罪构成四要件体系的基本组','new',0.387,0.7067,5,'ch2s6'],
  ['为什么犯罪主体的认定对刑事责任承','mastered',0.4455,0.4685,4,'ch2s6'],
  ['犯罪客观要件包括哪些内容？为什么','mastered',0.4319,0.6323,4,'ch2s6'],
  ['犯罪主观要件指的是什么？它包含哪','new',0.5523,0.6335,3,'ch2s6'],
  ['综合判断犯罪构成四要件时，排除犯','mastered',0.5192,0.6436,3,'ch2s6'],
  ['犯罪的阶段化理解为何要区分制造违','learning',0.4969,0.5948,3,'ch2s6'],
  ['解释法律上的因果关系在犯罪阶段划','mastered',0.3109,0.6013,4,'ch2s6'],
  ['如何运用介入因素两步走标准判断因','mastered',0.5755,0.7779,3,'ch2s6'],
  ['犯罪的主观要件在两个阶段区分中是','mastered',0.478,0.572,4,'ch2s6'],
  ['犯罪制造违法事实阶段与最终负刑事','mastered',0.4478,0.5333,3,'ch2s6'],
  ['请解释三段论定罪推理方法中大前提','weak',0.2677,0.6669,3,'ch2s6'],
  ['三段论定罪推理方法中，小前提为什','mastered',0.2217,0.6306,4,'ch2s6'],
  ['比较三段论定罪推理方法与直觉判断','mastered',0.3053,0.5542,3,'ch2s6'],
  ['三段论定罪推理方法中，如何处理事','mastered',0.3422,0.5667,6,'ch2s6'],
  ['在三段论定罪推理方法中，法律构成','new',0.2748,0.5893,4,'ch2s6'],
  // ── ch2s7 ──
  ['罪刑法定原则的核心内容包括哪些？','review_due',0.4386,0.7387,9,'ch2s7'],
  ['为什么罪刑法定原则禁止类推解释','mastered',0.4581,0.8363,5,'ch2s7'],
  ['罪刑法定原则如何保障国民的自由','mastered',0.5016,0.7981,4,'ch2s7'],
  ['以下哪项不是罪刑法定原则的核心内','new',0.5774,0.7181,4,'ch2s7'],
  ['罪刑法定原则中法无明文规定不为罪','mastered',0.5601,0.7447,3,'ch2s7'],
  ['罪刑相适应原则的核心内容是什么','mastered',0.5248,0.7233,4,'ch2s7'],
  ['量刑时为什么要考虑行为人的主观恶','mastered',0.5397,0.5375,4,'ch2s7'],
  ['量刑中客观危害性的考量包括哪些方','new',0.3469,0.6527,4,'ch2s7'],
  ['人身危险性在量刑中起什么作用','weak',0.4734,0.6652,3,'ch2s7'],
  ['量刑依据中，如何综合评价客观危害','mastered',0.4477,0.5579,3,'ch2s7'],
  ['罪刑相适应原则在量刑中如何体现','new',0.4525,0.684,3,'ch2s7'],
  ['刑法空间效力包含哪几个管辖原则？','mastered',0.3827,0.6541,3,'ch2s7'],
  ['为什么刑法时间效力中坚持从旧兼从','learning',0.4004,0.732,3,'ch2s7'],
  ['请比较属地管辖与属人管辖的异同','learning',0.2461,0.5702,3,'ch2s7'],
  ['保护管辖原则适用于哪些情形？请举','learning',0.4127,0.5617,4,'ch2s7'],
  ['普遍管辖原则的适用条件有哪些？请','mastered',0.3935,0.5868,5,'ch2s7'],
  ['什么是刑法中的从旧兼从轻原则','new',0.3775,0.6235,3,'ch2s7'],
];

const CONCEPTS: Concept[] = RAW.map(([name, status, x, y, deg, sectionId], i) => ({
  id: String(i),
  name, status, x, y, deg, sectionId,
  // Demo: 保留一小部分未加入当前计划的知识点，用于表达三个功能视图的范围差异。
  membership: i % 7 === 0 ? 'excluded' : 'included',
  chapterId: S_CH[sectionId],
  sx: csx(x), sy: csy(y),
}));

// [from_name, to_name] — subset of cosine top-3 relations
const RELATIONS: [string, string][] = [
  ['什么是变相受贿行为？请结合常见形','以交易形式变相受贿时，计算受贿数'],
  ['什么是变相受贿行为？请结合常见形','干股作为变相受贿表现为何？其应如'],
  ['以交易形式变相受贿时，计算受贿数','什么是共同受贿数额计算原则？为什'],
  ['以交易形式变相受贿时，计算受贿数','干股作为变相受贿表现为何？其应如'],
  ['在司法解释中，哪些行为被明确界定','为什么司法解释的效力次于立法解释'],
  ['在司法解释中，哪些行为被明确界定','请比较立法解释、司法解释和学理解'],
  ['在司法解释中，哪些行为被明确界定','当然解释在刑法解释中如何运用，为'],
  ['解释什么情况下国家工作人员收受财','受贿罪中，国家工作人员收受财物但'],
  ['解释什么情况下国家工作人员收受财','国家工作人员收受财物但无主观受贿'],
  ['国家工作人员受贿后因掩盖犯罪行为','为什么受贿罪要求国家工作人员必须'],
  ['国家工作人员受贿后因掩盖犯罪行为','受贿罪中，国家工作人员收受财物但'],
  ['为什么离职后收钱原则上不构成受贿','离职后收钱不构成受贿罪的法律依据'],
  ['为什么离职后收钱原则上不构成受贿','离职后收钱为什么不能认定为受贿罪'],
  ['离职后收钱为什么不能认定为受贿罪','受贿罪主体要件为什么不能认定离职'],
  ['以下哪种情形符合受贿罪既遂的标准','下列哪种情形不影响受贿罪既遂的认'],
  ['以下哪种情形符合受贿罪既遂的标准','受贿罪既遂的标准是什么？为什么不'],
  ['解释中间人模型中受贿罪数额如何划','中间人模型中，游说行为如何影响受'],
  ['解释中间人模型中受贿罪数额如何划','中间人模型中，乙隐瞒收钱，丙只猜'],
  ['在中间人模型中，乙收受100万元','在中间人模型二犯罪兼并中，乙收甲'],
  ['在中间人模型中，乙收受100万元','中间人模型中，乙隐瞒收钱，丙只猜'],
  ['比较斡旋受贿罪与利用影响力受贿罪','请比较利用影响力受贿罪与斡旋受贿'],
  ['比较斡旋受贿罪与利用影响力受贿罪','利用影响力受贿罪与普通受贿罪主体'],
  ['中间人模型中，游说行为如何影响受','游说与收钱行为在中间人模型二犯罪'],
  ['在乙隐瞒收钱而丙猜测知情的情形下','为什么乙隐瞒收钱而丙猜测知情时，'],
  ['中间人模型三共犯认定中，甲对乙和','中间人模型三共犯认定案件中，甲乙'],
  ['斡旋受贿罪的行为主体是谁','斡旋受贿与普通受贿的行为主体有何'],
  ['为什么说斡旋受贿罪成立不要求实际','为何斡旋受贿罪不要求实际实施斡旋'],
  ['斡旋受贿罪与普通受贿罪如何区分','斡旋受贿与普通受贿的主要区分标准'],
  ['斡旋受贿罪与普通受贿罪如何区分','利用影响力受贿罪与普通受贿罪主体'],
  ['利用影响力受贿罪与普通受贿罪主体','利用影响力受贿罪中关系密切人定义'],
  ['斡旋受贿罪成立的关键条件是什么','单位犯罪成立的条件有哪些？为什么'],
  ['受贿罪与渎职罪一般如何适用罪数关','受贿罪与渎职罪数罪并罚的意义是什'],
  ['为什么受贿罪与贪污罪属于竞合关系','以下关于受贿罪与贪污罪的关系描述'],
  ['什么是共同受贿数额计算原则？为什','共同受贿数额原则中，如何处理受贿'],
  ['共同受贿数额计算原则的法律依据和','离职后收钱不构成受贿罪的法律依据'],
  ['请解释行贿罪的构成要件包括哪些关','如何理解行贿罪与受贿罪的对向犯关'],
  ['如何区分行贿罪与受贿罪的主体','行贿罪的既遂标准是什么'],
  ['行贿罪既遂与受贿罪既遂在财物控制','行贿罪的既遂标准是什么'],
  ['受贿罪与渎职罪数罪并罚的意义是什','受贿罪与渎职罪一般如何适用罪数关'],
  ['为什么受贿罪的主体必须是国家工作','受贿罪中，国家工作人员必须具备什'],
  ['受贿罪中，国家工作人员收受财物但','国家工作人员收受财物但无主观受贿'],
  ['受贿罪成立的主观故意包含哪些要素','关于受贿罪的主观故意，下列哪些说'],
  ['犯罪客体的概念及其在犯罪构成中的','犯罪客体在犯罪构成要件中的功能体'],
  ['如何定义刑法中因果关系','为什么刑法中因果关系不认定仅凭时'],
  ['如何定义刑法中因果关系','什么是结果加重犯结构中的基本组成'],
  ['介入因素两步走判断标准包括哪些主','为什么要通过作用大小来判断介入因'],
  ['介入因素两步走判断标准包括哪些主','介入因素两步走判断标准在司法实践'],
  ['犯罪故意中的认识与意志因素是如何','犯罪故意与主客观一致原则为何重要'],
  ['如何区分直接故意、间接故意与过失','请解释直接故意和间接故意在犯罪主'],
  ['刑法解释的对象具体包括哪些内容','请比较立法解释、司法解释和学理解'],
  ['当然解释在刑法解释中如何运用，为','刑法解释理由的体系解释当然解释等'],
  ['当然解释在刑法解释中如何运用，为','目的解释为何在刑法解释中至关重要'],
  ['罪刑法定原则的核心内容包括哪些？','为什么罪刑法定原则禁止类推解释'],
  ['罪刑法定原则的核心内容包括哪些？','罪刑法定原则如何保障国民的自由'],
  ['罪刑相适应原则的核心内容是什么','量刑时为什么要考虑行为人的主观恶'],
  ['三段论定罪推理方法中，如何处理事','三段论定罪推理方法中，小前提为什'],
  ['三段论定罪推理方法中，如何处理事','在三段论定罪推理方法中，法律构成'],
  ['请解释犯罪构成四要件体系的基本组','犯罪客观要件包括哪些内容？为什么'],
  ['犯罪的阶段化理解为何要区分制造违','犯罪制造违法事实阶段与最终负刑事'],
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchesFilter(c: Concept, f: Filter) {
  if (f === 'all') return true;
  if (f === 'today') return c.status === 'new' || c.status === 'learning';
  if (f === 'review') return c.status === 'review_due';
  if (f === 'weak') return c.status === 'weak';
  if (f === 'mastered') return c.status === 'mastered';
  return true;
}

// Star fills use ONE warm-white glow hue distinguished only by brightness/size
// (spec §星空亮度制): NOT the semantic status hues. weak=#FF6252 is the sole exception.
function starVis(c: Concept, dimmed: boolean, sel: boolean) {
  const base = Math.max(2, c.deg * 0.52 + 1.5);
  const selBoost = sel ? 1.6 : 1;
  switch (c.status) {
    case 'mastered':  return { r: base * 1.45 * selBoost, fill:'#F7F2DA', op: dimmed ? 0.16 : 0.95, glow: !dimmed }; // brightest + bloom (终态)
    case 'learning':  return { r: base * 1.1 * selBoost,  fill:'#EAE2C6', op: dimmed ? 0.12 : 0.70, glow: false };   // medium bright
    case 'review_due':return { r: base * selBoost,         fill:'#CFCAB6', op: dimmed ? 0.10 : 0.46, glow: false };   // dimmed warm-white (压暗压深)
    case 'weak':      return { r: base * 1.1 * selBoost,  fill:'#FF6252', op: dimmed ? 0.12 : 0.80, glow: false };   // only warning-red exception
    case 'new':       return { r: base * 0.7 * selBoost,  fill:'#3C3F58', op: dimmed ? 0.08 : 0.36, glow: false };   // darkest outline
  }
}

const STATUS_LABEL: Record<Status, string> = {
  mastered:'已掌握', learning:'练习中', review_due:'待复习', new:'未学', weak:'薄弱',
};
const STATUS_DOT: Record<Status, string> = {
  mastered:'#00A63E', learning:'#2D8CFF', review_due:'#8E99B0', weak:'#FF6252', new:'#CCCCCC',
};

// 知识点详情（答案）— demo 缺省文案；思维导图/列表/预览闪卡中双击可编辑
function defaultAnswer(name: string) {
  return `【要点】围绕「${name.replace(/…$/, '')}」：\n① 明确定义与构成要件；\n② 掌握司法认定标准与典型情形；\n③ 注意与相近概念的区分辨析。`;
}

// 思维导图 / 列表共享的编辑操作（星图仅浏览；三视图同一份知识点数据）
interface EditOps {
  onOpenConcept: (c: Concept) => void;                 // 单击知识点 → 预览闪卡弹窗（与首页同源）
  onRenameConcept: (id: string, name: string) => void; // 改名（自动保存 + toast）
  onDeleteConcept: (id: string) => void;
  onRequestDelete: (name: string, run: () => void) => void; // 删除走重确认
  onAddConcept: (sectionId: string) => string;         // 模块下新增知识点，返回新 id
  onSaveAnswer: (id: string, text: string) => void;    // 答案自动保存 + toast
  onToast: (msg: string) => void;
  onSetMembership: (id: string, membership: PlanMembership) => void;
  getAnswer: (c: Concept) => string;
}

// ── Mind map view ──────────────────────────────────────────────────────────────

// Layout constants
const MM_NW = [68, 108, 148, 186]; // node width per level 0..3
const MM_NH = 28;                   // node height
const MM_HG = 32;                   // horiz gap between node edges
const MM_VG = 10;                   // vert gap between siblings

const MM_SC: Record<Status, string> = {
  mastered: '#00A63E', learning: '#2D8CFF', review_due: '#8E99B0',
  weak: '#FF6252', new: '#CCCCCC',
};

interface MMNode {
  id: string; label: string;
  level: number; side: 'root' | 'left' | 'right';
  children: MMNode[];
  status?: Status; membership?: PlanMembership; isUser?: boolean;
}
interface MMPos { cx: number; cy: number; level: number; side: 'root' | 'left' | 'right'; }

function mmNodeX(level: number, side: 'root' | 'left' | 'right'): number {
  if (side === 'root') return 0;
  const dir = side === 'right' ? 1 : -1;
  let x = MM_NW[0] / 2 + MM_HG;
  for (let l = 1; l < level; l++) x += MM_NW[l] + MM_HG;
  return dir * (x + MM_NW[level] / 2);
}

function mmSubH(node: MMNode, col: Set<string>): number {
  if (node.children.length === 0 || col.has(node.id)) return MM_NH;
  const sum = node.children.reduce((s, c) => s + mmSubH(c, col), 0);
  return Math.max(MM_NH, sum + (node.children.length - 1) * MM_VG);
}

function mmComputeLayout(root: MMNode, col: Set<string>): Map<string, MMPos> {
  const pos = new Map<string, MMPos>();
  pos.set('root', { cx: 0, cy: 0, level: 0, side: 'root' });

  function place(node: MMNode, startY: number) {
    const totalH = mmSubH(node, col);
    const cx = mmNodeX(node.level, node.side);
    const cy = startY + totalH / 2;
    pos.set(node.id, { cx, cy, level: node.level, side: node.side });
    if (!col.has(node.id) && node.children.length > 0) {
      let y = startY;
      for (const child of node.children) {
        place(child, y);
        y += mmSubH(child, col) + MM_VG;
      }
    }
  }

  for (const ch of root.children) {
    place(ch, -mmSubH(ch, col) / 2);
  }
  return pos;
}

function MindMapView({ concepts, filter, ops }: { concepts: Concept[]; filter: Filter; ops: EditOps }) {
  const conceptById = useMemo(() => new Map(concepts.map(c => [c.id, c])), [concepts]);
  // ── System tree ───────────────────────────────────────────────────────────
  const sysTree = useMemo<MMNode>(() => {
    const root: MMNode = { id: 'root', label: '刑法', level: 0, side: 'root', children: [] };
    for (const ch of CHAPTERS) {
      const side: 'left' | 'right' = ch.id === 'ch1' ? 'right' : 'left';
      const chNode: MMNode = { id: ch.id, label: ch.name, level: 1, side, children: [] };
      for (const sec of SECTIONS.filter(s => s.chId === ch.id)) {
        const secNode: MMNode = { id: sec.id, label: sec.name, level: 2, side, children: [] };
        for (const c of concepts.filter(c => c.sectionId === sec.id)) {
          secNode.children.push({ id: c.id, label: c.name, level: 3, side, children: [], status: c.status, membership: c.membership });
        }
        chNode.children.push(secNode);
      }
      root.children.push(chNode);
    }
    return root;
  }, [concepts]);

  // ── User overlay ──────────────────────────────────────────────────────────
  const [uKids, setUKids] = useState<Record<string, string[]>>({});
  const [uMeta, setUMeta] = useState<Record<string, { label: string; parentId: string; side: 'left'|'right'; level: number }>>({});

  const fullTree = useMemo<MMNode>(() => {
    function merge(node: MMNode): MMNode {
      const kids = node.children.map(merge);
      const extra = (uKids[node.id] || []).map(uid => {
        const m = uMeta[uid];
        if (!m) return null;
        return { id: uid, label: m.label, level: m.level, side: m.side as 'left'|'right', children: [], isUser: true } as MMNode;
      }).filter(Boolean) as MMNode[];
      return { ...node, children: [...kids, ...extra] };
    }
    return merge(sysTree);
  }, [sysTree, uKids, uMeta]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, MMNode>();
    function build(n: MMNode) { m.set(n.id, n); n.children.forEach(build); }
    build(fullTree); return m;
  }, [fullTree]);

  const parentMap = useMemo(() => {
    const m = new Map<string, string>();
    function build(n: MMNode) { n.children.forEach(c => { m.set(c.id, n.id); build(c); }); }
    build(fullTree); return m;
  }, [fullTree]);

  // ── Collapse: default expand root → chapter → module ─────────────────────
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    const s = new Set<string>();
    SECTIONS.forEach(sec => s.add(sec.id));
    return s;
  });

  // ── Pan / zoom ────────────────────────────────────────────────────────────
  const [pan, setPan] = useState({ x: 480, y: 240 });
  const [zoom, setZoom] = useState(0.88);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ down: false, sx: 0, sy: 0, px: 0, py: 0, moved: false });

  // ── UI state ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [warnMsg, setWarnMsg] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null); // 区分单击(预览)与双击(编辑)
  const lastClickRef = useRef<{ id: string; t: number }>({ id: '', t: 0 }); // 手动双击判定（SVG onDoubleClick 不可靠）

  // ── Layout ────────────────────────────────────────────────────────────────
  const positions = useMemo(() => mmComputeLayout(fullTree, collapsed), [fullTree, collapsed]);

  // ── Search ────────────────────────────────────────────────────────────────
  const searchMatches = useMemo(() => {
    if (!search.trim()) return new Set<string>();
    const q = search.toLowerCase();
    const s = new Set<string>();
    nodeMap.forEach((n, id) => { if (n.label.toLowerCase().includes(q)) s.add(id); });
    return s;
  }, [search, nodeMap]);

  useEffect(() => {
    if (searchMatches.size === 0) return;
    const toExpand = new Set<string>();
    searchMatches.forEach(id => { let p = parentMap.get(id); while (p) { toExpand.add(p); p = parentMap.get(p); } });
    setCollapsed(prev => { const n = new Set(prev); toExpand.forEach(id => n.delete(id)); return n; });
  }, [searchMatches]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Breadcrumb ────────────────────────────────────────────────────────────
  const breadcrumb = useMemo(() => {
    if (!selectedId) return [] as string[];
    const path: string[] = [selectedId];
    let p = parentMap.get(selectedId);
    while (p) { path.unshift(p); p = parentMap.get(p); }
    return path.map(id => nodeMap.get(id)?.label || '');
  }, [selectedId, parentMap, nodeMap]);

  // ── Visible graph ─────────────────────────────────────────────────────────
  const { visibleNodes, visibleEdges } = useMemo(() => {
    const nodes: MMNode[] = [];
    const edges: [string, string][] = [];
    function traverse(n: MMNode) {
      if (!positions.has(n.id)) return;
      nodes.push(n);
      if (!collapsed.has(n.id)) {
        for (const c of n.children) {
          if (positions.has(c.id)) { edges.push([n.id, c.id]); traverse(c); }
        }
      }
    }
    traverse(fullTree);
    return { visibleNodes: nodes, visibleEdges: edges };
  }, [fullTree, positions, collapsed]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function secDot(secId: string) {
    const cs = concepts.filter(c => c.sectionId === secId);
    if (!cs.length) return '#CCCCCC';
    const m = cs.filter(c => c.status === 'mastered').length;
    return m === cs.length ? '#00A63E' : m > cs.length * 0.5 ? '#2D8CFF' : '#8E99B0';
  }
  function chDot(chId: string) {
    const cs = concepts.filter(c => c.chapterId === chId);
    return !cs.length ? '#CCCCCC' : cs.filter(c => c.status === 'mastered').length > cs.length * 0.6 ? '#00A63E' : '#2D8CFF';
  }
  function bezierPath(fp: MMPos, tp: MMPos) {
    const fw = MM_NW[fp.level], tw = MM_NW[tp.level];
    const x1 = fp.side === 'root'
      ? fp.cx + (tp.side === 'right' ? fw / 2 : -fw / 2)
      : fp.side === 'right' ? fp.cx + fw / 2 : fp.cx - fw / 2;
    const x2 = tp.side === 'right' ? tp.cx - tw / 2 : tp.cx + tw / 2;
    const mx = (x1 + x2) / 2;
    return `M${x1},${fp.cy} C${mx},${fp.cy} ${mx},${tp.cy} ${x2},${tp.cy}`;
  }
  function commitEdit() {
    const val = editVal.trim();
    if (editing && val) {
      if (uMeta[editing]) {
        setUMeta(prev => ({ ...prev, [editing!]: { ...prev[editing!], label: val } }));
        ops.onToast('已保存');
      } else if (conceptById.has(editing)) {
        // 系统知识点改名：与列表视图共享同一份数据（自动保存 + toast 在上层）
        ops.onRenameConcept(editing, val);
      }
    }
    setEditing(null);
  }
  function removeUserNode(uid: string) {
    const parentId = uMeta[uid]?.parentId;
    setUMeta(prev => { const n = { ...prev }; delete n[uid]; return n; });
    if (parentId) setUKids(prev => ({ ...prev, [parentId]: (prev[parentId] || []).filter(k => k !== uid) }));
    if (selectedId === uid) setSelectedId(null);
  }

  // ── Toolbar ───────────────────────────────────────────────────────────────
  function fitScreen() {
    if (!containerRef.current || positions.size === 0) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    positions.forEach(p => {
      const w = MM_NW[p.level];
      minX = Math.min(minX, p.cx - w / 2); maxX = Math.max(maxX, p.cx + w / 2);
      minY = Math.min(minY, p.cy - MM_NH / 2); maxY = Math.max(maxY, p.cy + MM_NH / 2);
    });
    const W = containerRef.current.clientWidth, H = containerRef.current.clientHeight;
    const z = Math.min((W - 80) / (maxX - minX + 1), (H - 60) / (maxY - minY + 1), 1.8);
    setZoom(z);
    setPan({ x: W / 2 - ((minX + maxX) / 2) * z, y: H / 2 - ((minY + maxY) / 2) * z });
  }
  function toggleNode(id: string, node: MMNode) {
    const countDesc = (n: MMNode): number => 1 + n.children.reduce((s, c) => s + countDesc(c), 0);
    if (collapsed.has(id)) {
      if (positions.size + node.children.reduce((s, c) => s + countDesc(c), 0) > 80) {
        setWarnMsg('展开此节点将超过 80 个节点，建议按章节逐步展开');
        setTimeout(() => setWarnMsg(''), 3000);
        return;
      }
      setCollapsed(prev => { const n = new Set(prev); n.delete(id); return n; });
    } else {
      setCollapsed(prev => { const n = new Set(prev); n.add(id); return n; });
    }
  }
  function addChild(parentId: string, side: 'left' | 'right', parentLevel: number) {
    if (parentLevel === 2) {
      // 模块下新增 = 真实知识点，三视图（星图/思维导图/列表）同步出现
      const nid = ops.onAddConcept(parentId);
      setCollapsed(prev => { const n = new Set(prev); n.delete(parentId); return n; });
      setEditing(nid); setEditVal('新知识点');
      return;
    }
    const uid = `u_${Date.now()}`;
    const level = Math.min(parentLevel + 1, 3);
    setUMeta(prev => ({ ...prev, [uid]: { label: '新节点', parentId, side, level } }));
    setUKids(prev => ({ ...prev, [parentId]: [...(prev[parentId] || []), uid] }));
    setCollapsed(prev => { const n = new Set(prev); n.delete(parentId); return n; });
    setEditing(uid); setEditVal('新节点');
  }

  // ── Pointer events ────────────────────────────────────────────────────────
  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as Element).closest('[data-node]')) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { down: true, sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y, moved: false };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current.down) return;
    const dx = e.clientX - dragRef.current.sx, dy = e.clientY - dragRef.current.sy;
    if (Math.abs(dx) + Math.abs(dy) > 4) dragRef.current.moved = true;
    setPan({ x: dragRef.current.px + dx, y: dragRef.current.py + dy });
  }
  function onPointerUp() { dragRef.current.down = false; }
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom(z => Math.min(2.5, Math.max(0.25, z * (e.deltaY < 0 ? 1.1 : 0.91))));
  }

  // ── Minimap (computed before render) ─────────────────────────────────────
  let minimapEl: React.ReactNode = null;
  if (positions.size > 0) {
    const MW = 120, MH = 78;
    let mmMinX = Infinity, mmMaxX = -Infinity, mmMinY = Infinity, mmMaxY = -Infinity;
    positions.forEach(p => {
      const w = MM_NW[p.level];
      mmMinX = Math.min(mmMinX, p.cx - w / 2); mmMaxX = Math.max(mmMaxX, p.cx + w / 2);
      mmMinY = Math.min(mmMinY, p.cy - MM_NH / 2); mmMaxY = Math.max(mmMaxY, p.cy + MM_NH / 2);
    });
    const sc = Math.min((MW - 14) / (mmMaxX - mmMinX + 80), (MH - 14) / (mmMaxY - mmMinY + 40));
    const ox = MW / 2 - ((mmMinX + mmMaxX) / 2) * sc;
    const oy = MH / 2 - ((mmMinY + mmMaxY) / 2) * sc;
    const cW = containerRef.current?.clientWidth || 900;
    const cH = containerRef.current?.clientHeight || 460;
    const vpX = (-pan.x / zoom) * sc + ox, vpY = (-pan.y / zoom) * sc + oy;
    const vpW = (cW / zoom) * sc, vpH = (cH / zoom) * sc;
    minimapEl = (
      <div className="absolute bottom-3 right-3 rounded-lg overflow-hidden pointer-events-none"
        style={{ width: MW, height: MH, background: 'rgba(240,237,232,0.94)', border: '1px solid #D0CCC4', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
        <svg width={MW} height={MH}>
          {visibleEdges.map(([fId, tId]) => {
            const fp = positions.get(fId)!, tp = positions.get(tId)!;
            return <line key={`mme-${fId}-${tId}`}
              x1={fp.cx * sc + ox} y1={fp.cy * sc + oy}
              x2={tp.cx * sc + ox} y2={tp.cy * sc + oy}
              stroke="#B8B4AC" strokeWidth={0.8} />;
          })}
          {Array.from(positions.entries()).map(([id, p]) => (
            <rect key={`mmn-${id}`}
              x={p.cx * sc + ox - MM_NW[p.level] * sc / 2}
              y={p.cy * sc + oy - MM_NH * sc / 2}
              width={MM_NW[p.level] * sc} height={MM_NH * sc} rx={1}
              fill={p.level === 0 ? '#1E2240' : p.level === 1 ? '#2A3050' : '#9098B0'} />
          ))}
          <rect x={vpX} y={vpY} width={vpW} height={vpH}
            fill="none" stroke="#6888B0" strokeWidth={1.2} rx={2} opacity={0.7} />
        </svg>
      </div>
    );
  }

  const toolbarBtns: [string, () => void][] = [
    ['收起到章节', () => setCollapsed(new Set(['ch1', 'ch2']))],
    ['收起到模块', () => { const s = new Set<string>(); SECTIONS.forEach(sec => s.add(sec.id)); setCollapsed(s); }],
    ['适应屏幕', fitScreen],
  ];

  return (
    <div className="h-full flex flex-col select-none" style={{ background: '#F7F5F0' }}>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b flex-shrink-0"
        style={{ background: '#EFECE6', borderColor: '#DDD9D0', minHeight: 40 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 搜索知识点…"
          className="text-xs px-2.5 py-1 rounded-md border outline-none"
          style={{ background: '#FFF', borderColor: '#CCC9C0', color: '#333', width: 148 }} />
        <div className="flex-1" />
        {breadcrumb.length > 0 && (
          <div className="flex items-center gap-1 overflow-hidden max-w-[220px]">
            {breadcrumb.map((lbl, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ color: '#ccc', fontSize: 10 }}>›</span>}
                <span className="text-xs truncate" style={{ color: '#666', maxWidth: 68 }} title={lbl}>
                  {lbl.length > 7 ? lbl.slice(0, 7) + '…' : lbl}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
        {toolbarBtns.map(([label, fn]) => (
          <button key={label} onClick={fn}
            className="text-xs px-2 py-1 rounded hover:bg-[#DDD9D0] transition-colors flex-shrink-0"
            style={{ color: '#555', background: '#E4E0D8' }}>
            {label}
          </button>
        ))}
      </div>

      {warnMsg && (
        <div className="text-xs text-center px-3 py-1.5 flex-shrink-0"
          style={{ background: '#FFF9E6', color: '#7A6020', borderBottom: '1px solid #FFE080' }}>
          ⚠ {warnMsg}
        </div>
      )}

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden"
        style={{ cursor: dragRef.current.down ? 'grabbing' : 'grab' }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
        onWheel={onWheel}>

        <svg width="100%" height="100%" style={{ display: 'block' }}>
          <defs>
            <pattern id="mmgrid" x={pan.x % (22 * zoom)} y={pan.y % (22 * zoom)}
              width={22 * zoom} height={22 * zoom} patternUnits="userSpaceOnUse">
              <circle cx={1} cy={1} r={0.9} fill="#C4C0B8" opacity={0.5} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mmgrid)" />

          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            {/* Edges */}
            {visibleEdges.map(([fId, tId]) => {
              const fp = positions.get(fId)!, tp = positions.get(tId)!;
              return (
                <path key={`e-${fId}-${tId}`} d={bezierPath(fp, tp)}
                  fill="none" stroke="#C4C0B8" strokeWidth={1.5}
                  style={{ pointerEvents: 'none' }} />
              );
            })}

            {/* Nodes */}
            {visibleNodes.map(node => {
              const p = positions.get(node.id)!;
              const w = MM_NW[p.level], h = MM_NH;
              const x = p.cx - w / 2, y = p.cy - h / 2;
              const isSel = selectedId === node.id;
              const isCol = collapsed.has(node.id);
              const hasKids = node.children.length > 0;
              const isMatch = searchMatches.has(node.id);
              const searchDim = search.trim().length > 0 && searchMatches.size > 0 && !isMatch;
              const filterDim = filter !== 'all' && node.level === 3 && !!node.status && !matchesFilter({ status: node.status } as Concept, filter);
              const excluded = node.membership === 'excluded';
              const dimmed = searchDim || filterDim;
              const side = p.side;

              const bg = p.level === 0 ? '#1E2240' : p.level === 1 ? '#2A3050' : node.isUser ? '#EAF3FF' : '#FFFFFF';
              const fg = p.level <= 1 ? '#FFFFFF' : node.isUser ? '#2D8CFF' : '#2A2820';
              const bd = isSel ? '#2D8CFF' : p.level <= 1 ? 'transparent' : '#E0DCD4';
              const dotColor = node.status ? MM_SC[node.status] :
                p.level === 2 ? secDot(node.id) :
                p.level === 1 ? chDot(node.id) : 'transparent';
              const maxLen = p.level === 3 ? 13 : p.level === 2 ? 9 : 6;
              const lbl = node.label.length > maxLen ? node.label.slice(0, maxLen) + '…' : node.label;
              const hiddenCnt = isCol ? node.children.length : 0;
              const hx = side === 'left' ? x - 11 : x + w + 11;

              return (
                <g key={node.id} data-node="true" style={{ opacity: dimmed ? 0.18 : excluded ? 0.45 : 1 }}>
                  <rect x={x} y={y} width={w} height={h}
                    rx={p.level === 0 ? 10 : p.level === 1 ? 7 : 5}
                    fill={bg} stroke={bd} strokeWidth={isSel ? 2 : 1}
                    style={{ filter: isMatch ? 'drop-shadow(0 0 5px rgba(100,136,176,0.55))' : undefined, cursor: 'pointer' }}
                    onClick={() => {
                      if (dragRef.current.moved) return;
                      const now = Date.now();
                      const last = lastClickRef.current;
                      const isDbl = last.id === node.id && now - last.t < 320;
                      lastClickRef.current = { id: node.id, t: now };

                      if (isDbl) {
                        // 双击 = 就地进入编辑（光标闪烁，失焦/回车自动保存）
                        if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null; }
                        lastClickRef.current = { id: '', t: 0 };
                        if (node.isUser || conceptById.has(node.id)) {
                          setSelectedId(node.id);
                          setEditing(node.id); setEditVal(node.label);
                        }
                        return;
                      }
                      // 单击 = 纯选中节点（浮出「+」/删除按钮）；240ms 窗口内若再次点击则升级为双击编辑
                      if (clickTimer.current) clearTimeout(clickTimer.current);
                      clickTimer.current = setTimeout(() => {
                        setSelectedId(prev => (prev === node.id ? null : node.id));
                        clickTimer.current = null;
                      }, 240);
                    }}
                    onDoubleClick={() => {
                      // 兜底：部分浏览器仍会派发原生 dblclick
                      if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null; }
                      lastClickRef.current = { id: '', t: 0 };
                      if (node.isUser || conceptById.has(node.id)) {
                        setSelectedId(node.id);
                        setEditing(node.id); setEditVal(node.label);
                      }
                    }}
                  />
                  {p.level > 0 && dotColor !== 'transparent' && (
                    <circle cx={x + 9} cy={p.cy} r={3.5} fill={dotColor} style={{ pointerEvents: 'none' }} />
                  )}
                  <text
                    x={p.level === 0 ? p.cx : x + 18} y={p.cy}
                    textAnchor={p.level === 0 ? 'middle' : 'start'} dominantBaseline="middle"
                    fill={fg} fontSize={p.level === 0 ? 13 : p.level === 1 ? 11.5 : 11}
                    fontWeight={p.level <= 1 ? 700 : 500}
                    style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: 'system-ui,sans-serif' }}>
                    {lbl}
                  </text>
                  {excluded && p.level === 3 && (
                    <text x={x + w - 5} y={y + 6} textAnchor="end" fill="#A86600" fontSize={7.5}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}>未加入</text>
                  )}
                  {hasKids && (
                    <g onClick={e => { e.stopPropagation(); toggleNode(node.id, node); }} style={{ cursor: 'pointer' }}>
                      <circle cx={hx} cy={p.cy} r={7.5} fill="#EDE9E0" stroke="#C0BCB4" strokeWidth={1} />
                      <text x={hx} y={p.cy} textAnchor="middle" dominantBaseline="middle"
                        fill="#555" fontSize={11} fontWeight={700} style={{ userSelect: 'none' }}>
                        {isCol ? '+' : '−'}
                      </text>
                    </g>
                  )}
                  {hiddenCnt > 0 && (
                    <text x={side === 'left' ? x - 23 : x + w + 23} y={p.cy}
                      textAnchor="middle" dominantBaseline="middle"
                      fill="#AAA" fontSize={9} style={{ pointerEvents: 'none' }}>
                      {hiddenCnt}
                    </text>
                  )}
                  {isSel && p.level < 3 && (
                    <g style={{ cursor: 'pointer' }}
                      onClick={e => { e.stopPropagation(); addChild(node.id, side === 'root' ? 'right' : side as 'left'|'right', p.level); }}>
                      <circle cx={p.cx} cy={y + h + 11} r={8} fill="#6888B0" />
                      <text x={p.cx} y={y + h + 11} textAnchor="middle" dominantBaseline="middle"
                        fill="white" fontSize={13} fontWeight={700} style={{ userSelect: 'none' }}>+</text>
                    </g>
                  )}
                  {/* 删除（仅知识点/用户节点；重确认后从三视图同步移除） */}
                  {isSel && (node.isUser || conceptById.has(node.id)) && (
                    <g style={{ cursor: 'pointer' }}
                      onClick={e => {
                        e.stopPropagation();
                        if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null; }
                        if (node.isUser) ops.onRequestDelete(node.label, () => removeUserNode(node.id));
                        else ops.onRequestDelete(node.label, () => ops.onDeleteConcept(node.id));
                      }}>
                      <circle cx={hx} cy={p.cy - 19} r={7.5} fill="#E5484D" />
                      <text x={hx} y={p.cy - 19} textAnchor="middle" dominantBaseline="middle"
                        fill="white" fontSize={10} fontWeight={700} style={{ userSelect: 'none' }}>✕</text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Minimap */}
        {minimapEl}
      </div>

      {/* Floating edit input */}
      {editing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 100 }}>
          <input autoFocus value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null); }}
            onBlur={commitEdit}
            className="pointer-events-auto px-3 py-2 text-sm rounded-lg border-2 shadow-xl outline-none"
            style={{ borderColor: '#6888B0', background: '#FFF', minWidth: 180, color: '#222' }} />
        </div>
      )}
    </div>
  );
}

// ── List view ──────────────────────────────────────────────────────────────────

// 列表行交互与首页一致：单击就地展开答案，双击编辑答案（自动保存 + toast）；支持增删改
function ListView({ concepts, filter, ops }: { concepts: Concept[]; filter: Filter; ops: EditOps }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [openRows, setOpenRows] = useState<Set<string>>(new Set());     // 展开答案的知识点行
  const [editingAnswer, setEditingAnswer] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const toggle = (id: string) => setExpanded(s => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const toggleRow = (id: string) => setOpenRows(s => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  function commitAnswer(id: string) {
    if (editingAnswer === id) { ops.onSaveAnswer(id, draft); setEditingAnswer(null); }
  }
  function commitName(c: Concept) {
    if (editingName === c.id) {
      const v = draft.trim();
      if (v && v !== c.name) ops.onRenameConcept(c.id, v);
      setEditingName(null);
    }
  }

  const bySection = useMemo(() => {
    const m: Record<string, Concept[]> = {};
    SECTIONS.forEach(s => { m[s.id] = []; });
    concepts.forEach(c => {
      if (filter === 'all' || matchesFilter(c, filter)) m[c.sectionId]?.push(c);
    });
    return m;
  }, [concepts, filter]);

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#F9F8F4' }}>
      {CHAPTERS.map(ch => (
        <div key={ch.id} className="mb-1">
          <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider" style={{ color: '#6878A8', background: '#F0EDE6' }}>
            {ch.id === 'ch1' ? '刑法分论 · 贿赂与渎职犯罪' : '刑法总论 · 原理与构成'}
          </div>
          {SECTIONS.filter(s => s.chId === ch.id).map(sec => {
            const cs = bySection[sec.id] || [];
            const isExp = expanded.has(sec.id);
            const mCount = concepts.filter(c => c.sectionId === sec.id && c.status === 'mastered').length;
            const total = concepts.filter(c => c.sectionId === sec.id).length;
            if (cs.length === 0 && filter !== 'all') return null;
            return (
              <div key={sec.id} className="border-b" style={{ borderColor: '#E8E4D8' }}>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-white transition-colors"
                  onClick={() => toggle(sec.id)}
                >
                  <span className="text-[10px] transition-transform" style={{ color: '#999', transform: isExp ? 'rotate(90deg)' : 'none' }}>▶</span>
                  <span className="flex-1 text-sm font-medium" style={{ color: '#2A2820' }}>{sec.name}</span>
                  <span className="text-xs" style={{ color: '#00A63E' }}>{mCount}/{total}</span>
                </button>
                {isExp && (
                  <div className="pb-1">
                    {cs.length === 0 && (
                      <div className="px-8 py-2 text-xs" style={{ color: '#aaa' }}>无匹配知识点</div>
                    )}
                    {cs.map(c => {
                      const rowOpen = openRows.has(c.id);
                      return (
                        <div key={c.id} className="group">
                          <div
                            className="flex items-center gap-2.5 px-8 py-1.5 hover:bg-white cursor-pointer"
                            onClick={() => { if (editingName !== c.id) toggleRow(c.id); }}
                          >
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_DOT[c.status] }}/>
                            {editingName === c.id ? (
                              <input autoFocus value={draft}
                                onChange={e => setDraft(e.target.value)}
                                onClick={e => e.stopPropagation()}
                                onKeyDown={e => { if (e.key === 'Enter') commitName(c); if (e.key === 'Escape') setEditingName(null); }}
                                onBlur={() => commitName(c)}
                                className="flex-1 text-xs px-1.5 py-0.5 rounded border outline-none"
                                style={{ borderColor: '#6888B0', background: '#FFF', color: '#333' }} />
                            ) : (
                              <span className="flex-1 text-xs" style={{ color: '#333' }}
                                onDoubleClick={e => { e.stopPropagation(); setEditingName(c.id); setDraft(c.name); }}
                                title="双击修改名称">
                                {c.name}
                              </span>
                            )}
                            <span className="text-[10px]" style={{ color: '#aaa' }}>{STATUS_LABEL[c.status]}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{
                              background: c.membership === 'included' ? '#EEF6FF' : '#F1F1F1',
                              color: c.membership === 'included' ? '#2D8CFF' : '#888',
                            }}>{c.membership === 'included' ? '已加入' : '未加入'}</span>
                            {c.membership === 'excluded' && (
                              <button className="text-[10px] px-2 py-0.5 rounded"
                                onClick={e => { e.stopPropagation(); ops.onSetMembership(c.id, 'included'); }}
                                style={{ background: '#FFF7D6', color: '#7A6200' }}>加入计划</button>
                            )}
                            <button className="text-[10px] px-2 py-0.5 rounded" onClick={e => e.stopPropagation()} style={{
                              background: c.status === 'mastered' ? '#F6FEF9' : '#EAF3FF',
                              color: c.status === 'mastered' ? '#00A63E' : '#2D8CFF',
                            }}>
                              {c.status === 'mastered' ? '复习' : '学习'}
                            </button>
                            {/* 删除（重确认） */}
                            <button
                              className="text-[10px] px-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: '#E5484D' }}
                              title="删除知识点"
                              onClick={e => { e.stopPropagation(); ops.onRequestDelete(c.name, () => ops.onDeleteConcept(c.id)); }}>
                              ✕
                            </button>
                          </div>
                          {/* 就地展开：答案（与首页一致）；双击编辑，失焦/回车自动保存 */}
                          {rowOpen && (
                            <div className="mx-8 mb-1.5 px-3 py-2 rounded-lg" style={{ background: '#FFFDF5', border: '1px solid #EDE8D8' }}>
                              {editingAnswer === c.id ? (
                                <textarea autoFocus value={draft}
                                  onChange={e => setDraft(e.target.value)}
                                  onClick={e => e.stopPropagation()}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitAnswer(c.id); }
                                    if (e.key === 'Escape') setEditingAnswer(null);
                                  }}
                                  onBlur={() => commitAnswer(c.id)}
                                  rows={4}
                                  className="w-full text-xs p-2 rounded border outline-none resize-none"
                                  style={{ borderColor: '#6888B0', background: '#FFF', color: '#333', lineHeight: 1.6 }} />
                              ) : (
                                <p className="text-xs whitespace-pre-wrap m-0" style={{ color: '#555', lineHeight: 1.6, cursor: 'text' }}
                                  onDoubleClick={e => { e.stopPropagation(); setEditingAnswer(c.id); setDraft(ops.getAnswer(c)); }}
                                  title="双击编辑答案">
                                  {ops.getAnswer(c)}
                                </p>
                              )}
                              <p className="text-[10px] m-0 mt-1.5" style={{ color: '#B8B098' }}>双击可编辑答案 · 失焦自动保存</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {/* 新增知识点（与思维导图共享同一份数据） */}
                    {filter === 'all' && (
                      <button
                        className="flex items-center gap-1.5 px-8 py-1.5 text-xs hover:bg-white transition-colors w-full text-left"
                        style={{ color: '#6888B0' }}
                        onClick={() => {
                          const nid = ops.onAddConcept(sec.id);
                          setOpenRows(s => new Set(s));
                          setEditingName(nid); setDraft('新知识点');
                        }}>
                        ＋ 添加知识点
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── 预览闪卡弹窗（与首页预览闪卡同源：正面问题/背面答案，点卡翻面）──────────────
// 背面答案双击可编辑，失焦/回车自动保存（toast 在上层）

function ConceptFlashcardModal({ concept, answer, onClose, onSaveAnswer }: {
  concept: Concept; answer: string;
  onClose: () => void; onSaveAnswer: (id: string, text: string) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  function commit() {
    if (editing) { onSaveAnswer(concept.id, draft); setEditing(false); }
  }

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 120,
        background: 'rgba(10,10,20,0.55)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 480, maxWidth: '86%', perspective: 1000 }}>
        {/* Top meta + 关闭 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '0 2px' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
            {SECTIONS.find(s => s.id === concept.sectionId)?.name || '知识点'} · 预览闪卡
          </span>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.15)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0,
          }}>✕</button>
        </div>

        {/* Flip container — 点卡片本体翻面（与首页同手势） */}
        <div
          onClick={() => { if (!editing) setFlipped(f => !f); }}
          style={{
            position: 'relative', transformStyle: 'preserve-3d', cursor: 'pointer',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.44s ease',
          }}>
          {/* Front */}
          <div style={{
            backfaceVisibility: 'hidden', background: '#fff', borderRadius: 20,
            padding: '34px 34px 26px', minHeight: 240,
            display: 'flex', flexDirection: 'column',
          }}>
            <span style={{ fontSize: 11, color: '#999', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>
              知识点 · 正面
            </span>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.5, flex: 1, marginBottom: 20 }}>
              {concept.name}
            </p>
            <p style={{ fontSize: 12, color: '#999', margin: 0, textAlign: 'center' }}>点击翻面看答案</p>
          </div>

          {/* Back — 答案；双击编辑，失焦/回车自动保存（无保存/取消按钮） */}
          <div style={{
            backfaceVisibility: 'hidden', background: '#fff', borderRadius: 20,
            padding: '34px 34px 26px', minHeight: 240,
            position: 'absolute', top: 0, left: 0, right: 0,
            transform: 'rotateY(180deg)',
            display: 'flex', flexDirection: 'column',
          }}>
            <span style={{ fontSize: 11, color: '#00A63E', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18, display: 'block' }}>
              知识点 · 背面
            </span>
            {editing ? (
              <textarea autoFocus value={draft}
                onChange={e => setDraft(e.target.value)}
                onClick={e => e.stopPropagation()}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); }
                  if (e.key === 'Escape') setEditing(false);
                }}
                onBlur={commit}
                rows={6}
                style={{
                  flex: 1, marginBottom: 14, padding: 10, fontSize: 13.5, lineHeight: 1.7, color: '#333',
                  border: '1.5px solid #6888B0', borderRadius: 10, outline: 'none', resize: 'none', fontFamily: 'inherit',
                }} />
            ) : (
              <p
                onDoubleClick={e => { e.stopPropagation(); setDraft(answer); setEditing(true); }}
                title="双击编辑答案"
                style={{ fontSize: 13.5, color: '#333', lineHeight: 1.7, flex: 1, marginBottom: 14, whiteSpace: 'pre-wrap' }}>
                {answer}
              </p>
            )}
            <p style={{ fontSize: 11, color: '#BBB', margin: 0, textAlign: 'center' }}>
              双击可编辑答案 · 失焦自动保存 · 点卡片翻回正面
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

interface KnowledgeMapScreenProps {
  onBack: () => void;
  defaultFilter?: Filter;
}

export default function KnowledgeMapScreen({ onBack, defaultFilter = 'all' }: KnowledgeMapScreenProps) {
  const [view, setView] = useState<ViewMode>('star');
  const [filter, setFilter] = useState<Filter>(defaultFilter);
  const [scale, setScale] = useState(0.42);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [selected, setSelected] = useState<Concept | null>(null);
  const [bubblePos, setBubblePos] = useState({ x: 0, y: 0 });
  const [hint1, setHint1] = useState(true);
  const [hint2, setHint2] = useState(false);
  const [mindMapScope, setMindMapScope] = useState<'current' | 'all'>('current');
  const [listMembership, setListMembership] = useState<'all' | PlanMembership>('all');

  // ── 三视图共享的知识点数据（思维导图/列表可增删改，星图仅浏览） ──
  const [concepts, setConcepts] = useState<Concept[]>(CONCEPTS);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<Concept | null>(null);
  const [confirmDel, setConfirmDel] = useState<{ name: string; run: () => void } | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2000);
  }, []);

  const getAnswer = useCallback(
    (c: Concept) => answers[c.id] ?? defaultAnswer(c.name),
    [answers],
  );

  const ops: EditOps = useMemo(() => ({
    onOpenConcept: (c) => setPreview(c),
    onRenameConcept: (id, name) => {
      setConcepts(cs => cs.map(c => c.id === id ? { ...c, name } : c));
      setPreview(p => (p && p.id === id ? { ...p, name } : p));
      showToast('已保存');
    },
    onDeleteConcept: (id) => {
      setConcepts(cs => cs.filter(c => c.id !== id));
      setPreview(p => (p && p.id === id ? null : p));
      setSelected(s => (s && s.id === id ? null : s));
      showToast('已删除');
    },
    onRequestDelete: (name, run) => setConfirmDel({ name, run }),
    onAddConcept: (sectionId) => {
      const sec = SECTIONS.find(s => s.id === sectionId);
      const nid = `u${Date.now()}`;
      const x = (sec?.cx ?? 0.5) + (Math.random() - 0.5) * 0.06;
      const y = (sec?.cy ?? 0.5) + (Math.random() - 0.5) * 0.06;
      const nc: Concept = {
        id: nid, name: '新知识点', status: 'new',
        membership: 'included',
        x, y, deg: 3, sectionId, chapterId: S_CH[sectionId],
        sx: csx(x), sy: csy(y),
      };
      setConcepts(cs => [...cs, nc]);
      return nid;
    },
    onSaveAnswer: (id, text) => {
      setAnswers(a => ({ ...a, [id]: text }));
      showToast('已保存');
    },
    onToast: showToast,
    onSetMembership: (id, membership) => {
      setConcepts(cs => cs.map(c => c.id === id ? { ...c, membership } : c));
      showToast(membership === 'included' ? '已加入当前计划' : '已移出当前计划');
    },
    getAnswer,
  }), [showToast, getAnswer]);

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ on: false, moved: false, sx: 0, sy: 0, spx: 0, spy: 0 });

  // Entrance fly-to animation
  useEffect(() => {
    let raf: number;
    let t0: number | null = null;
    const run = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / 750, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setScale(0.42 + 0.64 * e); // → 1.06
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, []);

  const lod = scale < 0.9 ? 0 : scale < 1.8 ? 1 : 2;

  const handleViewChange = (v: ViewMode) => {
    setView(v);
    if (hint1) { setHint1(false); setTimeout(() => setHint2(true), 50); }
  };

  const handleFilterChange = (f: Filter) => {
    setFilter(f);
    if (hint2) setHint2(false);
    setSelected(null);
  };

  // Pan/zoom handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragState.current = { on: true, moved: false, sx: e.clientX, sy: e.clientY, spx: panX, spy: panY };
  }, [panX, panY]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.current.on) return;
    const dx = e.clientX - dragState.current.sx;
    const dy = e.clientY - dragState.current.sy;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragState.current.moved = true;
      setPanX(dragState.current.spx + dx);
      setPanY(dragState.current.spy + dy);
    }
  }, []);

  const onMouseUp = useCallback(() => { dragState.current.on = false; }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale(s => Math.max(0.28, Math.min(5, s * (e.deltaY < 0 ? 1.12 : 0.89))));
    setSelected(null);
  }, []);

  const handleStarClick = useCallback((e: React.MouseEvent, c: Concept) => {
    e.stopPropagation();
    if (dragState.current.moved) return;
    const rect = svgContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setBubblePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setSelected(c);
  }, []);

  // Derived data
  const byName = useMemo(() => new Map(concepts.map(c => [c.name, c])), [concepts]);
  const visibleRelations = useMemo(() => {
    if (lod < 2) return [];
    return RELATIONS
      .map(([from, to]) => ({ from: byName.get(from), to: byName.get(to) }))
      .filter((r): r is { from: Concept; to: Concept } => !!(r.from && r.to && r.from.id !== r.to.id));
  }, [lod, byName]);

  const includedConcepts = useMemo(() => concepts.filter(c => c.membership === 'included'), [concepts]);
  const masteredCount = includedConcepts.filter(c => c.status === 'mastered').length;
  const litPct = Math.round(masteredCount / Math.max(1, includedConcepts.length) * 100);
  const mindMapConcepts = mindMapScope === 'current' ? includedConcepts : concepts;
  const listConcepts = listMembership === 'all' ? concepts : concepts.filter(c => c.membership === listMembership);

  // Spec §筛选chip: ONLY 4 resident chips — 全部 / 待复习 / 薄弱 / 已掌握.
  // 「今日待学」is forbidden as a resident chip; it exists ONLY as a transient
  // highlight when arriving from Today's「查看全部 →」(defaultFilter='today').
  const FILTER_CHIPS: { id: Filter; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'review', label: '待复习' },
    { id: 'weak', label: '薄弱' },
    { id: 'mastered', label: '已掌握' },
  ];

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#0B0D14' }}>
      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5"
        style={{ background: 'rgba(11,13,20,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => onBack()} className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80"
          style={{ color: 'rgba(255,255,255,0.65)' }}>
          <ArrowLeft size={16}/>
          <span>返回</span>
        </button>
        <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.12)' }}/>
        <span className="font-semibold text-sm" style={{ color: '#F0ECE0' }}>知识体系</span>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {litPct}% 已亮 · 本周新点亮 8 颗
        </span>

        {/* View switcher */}
        <div className="ml-auto flex items-center gap-0.5 rounded-lg p-0.5"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          {([['star','★ 星空'],['mindmap','思维导图'],['list','列表']] as [ViewMode, string][]).map(([v, label]) => (
            <button key={v}
              onClick={() => handleViewChange(v)}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
              style={{
                background: view === v ? 'rgba(253,234,59,0.16)' : 'transparent',
                color: view === v ? '#FDEA3B' : 'rgba(255,255,255,0.45)',
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Hint 1 */}
      {hint1 && view === 'star' && (
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-1.5"
          style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.32)' }}>
            三个视图职责不同：星空看成就，导图理结构，列表管全量
          </span>
          <button onClick={() => { setHint1(false); setHint2(true); }}
            style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>×</button>
        </div>
      )}

      {/* ── Filter chips ── */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,20,0.8)' }}>
        {FILTER_CHIPS.map(chip => (
          <button key={chip.id}
            onClick={() => handleFilterChange(chip.id)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              background: filter === chip.id ? 'rgba(253,234,59,0.20)' : 'rgba(255,255,255,0.06)',
              color: filter === chip.id ? '#FDEA3B' : 'rgba(255,255,255,0.45)',
              border: filter === chip.id ? '1px solid rgba(253,234,59,0.45)' : '1px solid transparent',
            }}>
            {chip.label}
          </button>
        ))}
        {/* Transient「今日待学」highlight (from Today「查看全部 →」), not a resident chip */}
        {filter === 'today' && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: 'rgba(45,140,255,0.16)', color: '#6FB0FF', border: '1px solid rgba(45,140,255,0.35)' }}>
            <span>正在高亮今日那批</span>
            <button onClick={() => handleFilterChange('all')}
              className="transition-opacity hover:opacity-70" style={{ color: '#6FB0FF' }} aria-label="清除今日高亮">
              <X size={12}/>
            </button>
          </div>
        )}
      </div>

      {/* 范围控制按视图分层：星空固定当前计划，导图可看全量，列表承担全局兜底。 */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,20,0.88)' }}>
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,.38)' }}>查看范围</span>
        {view === 'star' && (
          <span className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: 'rgba(253,234,59,.16)', color: '#FDEA3B' }}>当前计划 · 成就视图</span>
        )}
        {view === 'mindmap' && ([['current','当前计划'],['all','全部知识点']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setMindMapScope(id)} className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: mindMapScope === id ? 'rgba(253,234,59,.16)' : 'rgba(255,255,255,.06)',
              color: mindMapScope === id ? '#FDEA3B' : 'rgba(255,255,255,.5)' }}>{label}</button>
        ))}
        {view === 'list' && ([['all','全部'],['included','已加入'],['excluded','未加入']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setListMembership(id)} className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: listMembership === id ? 'rgba(253,234,59,.16)' : 'rgba(255,255,255,.06)',
              color: listMembership === id ? '#FDEA3B' : 'rgba(255,255,255,.5)' }}>{label}</button>
        ))}
        <span className="ml-auto text-[11px]" style={{ color: 'rgba(255,255,255,.32)' }}>
          {view === 'star' ? `${includedConcepts.length} 个计划内知识点` :
            view === 'mindmap' ? `${mindMapConcepts.length} 个知识点` : `${listConcepts.length} / ${concepts.length} 个知识点`}
        </span>
      </div>

      {/* Hint 2 */}
      {hint2 && (
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-1.5"
          style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.32)' }}>
            点这里筛选查看范围：只看薄弱 / 已掌握
          </span>
          <button onClick={() => setHint2(false)} style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>×</button>
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 relative overflow-hidden">

        {/* Star map */}
        {view === 'star' && (
          <div ref={svgContainerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            onWheel={onWheel} onClick={() => setSelected(null)}>
            <svg
              width="100%" height="100%"
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              preserveAspectRatio="xMidYMid meet"
              style={{ display:'block' }}>
              <defs>
                <filter id="bloom" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="4" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="bloomSm" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="2" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {/* Deep space background */}
              <rect width={SVG_W} height={SVG_H} fill="#0B0D14"/>

              {/* Dust stars (fixed background) */}
              <g>
                {DUST.map((d, i) => (
                  <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#B8C0D8" opacity={d.op}/>
                ))}
              </g>

              {/* Pan/zoom group */}
              <g transform={`translate(${CX + panX} ${CY + panY}) scale(${scale})`}>

                {/* Chapter anchor labels (always visible, fade with LOD) */}
                {CHAPTERS.map(ch => (
                  <text key={ch.id}
                    x={csx(ch.cx)} y={csy(ch.cy)}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={50 / scale}
                    fontWeight="700"
                    fill="rgba(200,210,255,0.07)"
                    style={{ transition: 'font-size 0.3s', pointerEvents: 'none', userSelect: 'none' }}>
                    {ch.name}
                  </text>
                ))}

                {/* Section markers (LOD 1+) */}
                {lod >= 1 && SECTIONS.map(sec => (
                  <g key={sec.id} style={{ transition: 'opacity 0.4s', opacity: lod >= 1 ? 1 : 0 }}>
                    <circle cx={csx(sec.cx)} cy={csy(sec.cy)}
                      r={4/scale} fill="rgba(180,190,220,0.18)" stroke="rgba(180,190,220,0.25)" strokeWidth={0.5/scale}/>
                    <text x={csx(sec.cx)} y={csy(sec.cy) - 7/scale}
                      textAnchor="middle"
                      fontSize={9/scale}
                      fill="rgba(180,190,220,0.38)"
                      style={{ pointerEvents:'none', userSelect:'none' }}>
                      {sec.name}
                    </text>
                  </g>
                ))}

                {/* Relation lines (LOD 2) */}
                {visibleRelations.map((r, i) => {
                  const lit = r.from.status === 'mastered' || r.to.status === 'mastered';
                  return (
                    <line key={i}
                      x1={r.from.sx} y1={r.from.sy}
                      x2={r.to.sx} y2={r.to.sy}
                      stroke={lit ? '#5577CC' : '#2A3055'}
                      strokeWidth={0.6/scale}
                      opacity={lit ? 0.45 : 0.18}
                      style={{ pointerEvents:'none' }}/>
                  );
                })}

                {/* Stars (concepts) */}
                {includedConcepts.map(c => {
                  const fMatch = matchesFilter(c, filter);
                  const dimmed = filter !== 'all' && !fMatch;
                  const isSel = selected?.id === c.id;
                  const v = starVis(c, dimmed, isSel);
                  return (
                    <g key={c.id}
                      onClick={(e) => handleStarClick(e, c)}
                      style={{ cursor: lod >= 1 ? 'pointer' : 'default', pointerEvents: lod >= 1 ? 'all' : 'none' }}>
                      {v.glow && (
                        <circle cx={c.sx} cy={c.sy} r={v.r * 2.2} fill={v.fill} opacity={v.op * 0.25}
                          filter="url(#bloom)" style={{ pointerEvents:'none' }}/>
                      )}
                      <circle cx={c.sx} cy={c.sy} r={v.r} fill={v.fill} opacity={v.op}
                        filter={v.glow ? 'url(#bloomSm)' : undefined}/>
                      {isSel && (
                        <circle cx={c.sx} cy={c.sy} r={v.r + 2.5/scale}
                          fill="none" stroke="#F5F0D0" strokeWidth={1/scale} opacity={0.9}/>
                      )}
                      {/* Name label: show when selected OR filter match at detail LOD */}
                      {(isSel || (fMatch && filter !== 'all' && lod >= 1)) && (
                        <text x={c.sx} y={c.sy - v.r - 3/scale}
                          textAnchor="middle"
                          fontSize={9/scale}
                          fill={isSel ? '#F5F0D0' : 'rgba(220,210,170,0.75)'}
                          style={{ pointerEvents:'none', userSelect:'none' }}>
                          {c.name.length > 12 ? c.name.slice(0, 12) + '…' : c.name}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Bubble popup */}
            {selected && (
              <div
                className="absolute z-20 rounded-xl shadow-2xl pointer-events-auto"
                style={{
                  left: Math.min(bubblePos.x - 120, SVG_W - 260),
                  top: Math.max(bubblePos.y - 148, 8),
                  width: 240,
                  background: 'rgba(18,20,34,0.97)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(12px)',
                }}
                onClick={(e) => e.stopPropagation()}>
                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs leading-snug font-medium flex-1" style={{ color: '#F0ECE0' }}>
                      {selected.name}
                    </p>
                    <button onClick={() => setSelected(null)} style={{ color: 'rgba(255,255,255,0.35)', flexShrink:0 }}>
                      <X size={13}/>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="w-2 h-2 rounded-full" style={{ background: STATUS_DOT[selected.status] }}/>
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {STATUS_LABEL[selected.status]}
                    </span>
                    <span className="text-[11px] ml-auto" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      枢纽度 {selected.deg}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setPreview(selected); setSelected(null); }}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                      style={{ background: 'rgba(253,234,59,0.18)', color: '#FDEA3B', border: '1px solid rgba(253,234,59,0.4)' }}>
                      看闪卡
                    </button>
                    <button className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                      style={{ background: 'rgba(45,140,255,0.18)', color: '#6FB0FF', border: '1px solid rgba(45,140,255,0.4)' }}>
                      去练习
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Zoom hint */}
            {lod === 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] pointer-events-none"
                style={{ color: 'rgba(255,255,255,0.28)' }}>
                滚轮放大 · 拖拽平移
              </div>
            )}
          </div>
        )}

        {/* Mind map */}
        {view === 'mindmap' && (
          <MindMapView concepts={mindMapConcepts} filter={filter} ops={ops}/>
        )}

        {/* List */}
        {view === 'list' && (
          <ListView concepts={listConcepts} filter={filter} ops={ops}/>
        )}
      </div>

      {/* 预览闪卡弹窗（与首页同源）：单击知识点叶子 / 星图气泡「看闪卡」弹出 */}
      {preview && (
        <ConceptFlashcardModal
          concept={preview}
          answer={getAnswer(preview)}
          onClose={() => setPreview(null)}
          onSaveAnswer={ops.onSaveAnswer}
        />
      )}

      {/* 删除重确认（删除不可恢复，保留重确认；编辑保存则自动化） */}
      {confirmDel && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 140,
          background: 'rgba(10,10,20,0.55)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setConfirmDel(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 320, background: '#fff', borderRadius: 16, padding: '22px 22px 18px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.35)',
          }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>删除知识点</p>
            <p style={{ fontSize: 12.5, color: '#666', lineHeight: 1.6, margin: '0 0 18px' }}>
              确认删除「{confirmDel.name.length > 18 ? confirmDel.name.slice(0, 18) + '…' : confirmDel.name}」？
              删除后将从星图、思维导图与列表中同步移除，且不可恢复。
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDel(null)} style={{
                flex: 1, padding: '9px 0', borderRadius: 10, cursor: 'pointer',
                border: '1px solid #E0E0E0', background: '#fff', color: '#555', fontSize: 13, fontWeight: 600,
              }}>取消</button>
              <button onClick={() => { confirmDel.run(); setConfirmDel(null); }} style={{
                flex: 1, padding: '9px 0', borderRadius: 10, cursor: 'pointer',
                border: 'none', background: '#E5484D', color: '#fff', fontSize: 13, fontWeight: 700,
              }}>确认删除</button>
            </div>
          </div>
        </div>
      )}

      {/* 自动保存 toast */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: 26, left: '50%', transform: 'translateX(-50%)', zIndex: 160,
          background: 'rgba(20,22,34,0.92)', color: '#fff', fontSize: 12.5, fontWeight: 600,
          padding: '8px 18px', borderRadius: 999, boxShadow: '0 4px 18px rgba(0,0,0,0.35)',
          pointerEvents: 'none',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
