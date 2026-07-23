import svgPaths from "./svg-ihs755yiwl";

function Menu() {
  return (
    <div className="absolute left-[7.99px] size-[20px] top-[7.99px]" data-name="Menu">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Menu">
          <path d="M3.33333 4.16667H16.6667" id="Vector" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M3.33333 10H16.6667" id="Vector_2" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M3.33333 15.8333H16.6667" id="Vector_3" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="relative shrink-0 size-[35.99px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Menu />
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[36.988px] relative rounded-[18641400px] shrink-0 w-[108.845px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[21px] left-[53.99px] not-italic text-[#666] text-[14px] text-center top-[8.22px] tracking-[-0.1504px] whitespace-nowrap">All Notes</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#fdea3b] drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.1)] h-[36.988px] relative rounded-[18641400px] shrink-0 w-[137.248px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[21px] left-[68.99px] not-italic text-[#333] text-[14px] text-center top-[8.22px] tracking-[-0.1504px] whitespace-nowrap">Review Mode</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="h-[36.988px] relative rounded-[18641400px] shrink-0 w-[160.59px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[21px] left-[79.99px] not-italic text-[#666] text-[14px] text-center top-[8.22px] tracking-[-0.1504px] whitespace-nowrap">Resource Center</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-[#f3f4f6] h-[44.974px] relative rounded-[18641400px] shrink-0 w-[422.656px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.993px] items-center pl-[3.993px] relative size-full">
        <Button1 />
        <Button2 />
        <Button3 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="flex-[1_0_0] h-[44.974px] min-w-px relative" data-name="Container">
      <div className="flex flex-row justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start justify-center relative size-full">
          <Container4 />
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return <div className="h-0 relative shrink-0 w-[40px]" data-name="Container" />;
}

function Container2() {
  return (
    <div className="h-[60px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center relative size-full">
          <Button />
          <Container3 />
          <Container5 />
        </div>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.94)] content-stretch flex flex-col h-[60.556px] items-start left-0 pb-[0.556px] px-[31.997px] top-0 w-[991.111px]" data-name="Container">
      <div aria-hidden className="absolute border border-[#e8e8e4] border-solid inset-0 pointer-events-none" />
      <Container2 />
    </div>
  );
}

function H() {
  return <div className="absolute h-[34px] left-[48.44px] top-[97.72px] w-[500px]" data-name="h1" />;
}

function Button4() {
  return (
    <div className="absolute bg-[#fdea3b] h-[54px] left-[171.44px] rounded-[16px] top-[417.72px] w-[284px]" data-name="button">
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold h-[24px] leading-[24px] left-[154px] not-italic text-[#1c1c1c] text-[16px] text-center top-[15px] tracking-[-0.4688px] w-[208px]">Create a Study Space</p>
    </div>
  );
}

function Container8() {
  return <div className="absolute left-[12.44px] size-[95.998px] top-[312.72px]" data-name="Container" />;
}

function Text() {
  return (
    <div className="absolute bg-[#fdea3b] h-[32.743px] left-[269.62px] rounded-[6px] top-0 w-[184.297px]" data-name="Text">
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[28.75px] left-[92.49px] not-italic text-[#111827] text-[25px] text-center top-[0.89px] tracking-[-0.6px] whitespace-nowrap">Start learning.</p>
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[32.743px] relative shrink-0 w-[453.915px]" data-name="Heading 1">
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[28.75px] left-[135.5px] not-italic text-[#111827] text-[25px] text-center top-[0.89px] tracking-[-0.6px] whitespace-nowrap">{`Stop organizing notes. `}</p>
      <Text />
    </div>
  );
}

function Heading1Margin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[10px] pb-[36px] top-[44px]" data-name="Heading 1 (margin)">
      <Heading />
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute bg-[#357bff] h-[24.479px] left-[445px] rounded-[18641400px] top-[26px] w-[49.201px]" data-name="Container">
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[16px] left-[25px] not-italic text-[15px] text-center text-white top-[4.66px] tracking-[0.45px] whitespace-nowrap">X10</p>
    </div>
  );
}

function H1() {
  return (
    <div className="absolute h-[88px] left-[76.44px] top-[-34.28px] w-[510px]" data-name="h1">
      <Heading1Margin />
      <Container9 />
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[500px] relative shrink-0 w-[620px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <H />
        <Button4 />
        <Container8 />
        <H1 />
        <p className="[word-break:break-word] absolute font-['Inter:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal h-[47px] leading-[normal] left-[38.44px] not-italic opacity-60 text-[15px] text-black top-[346.72px] w-[579px]">适合知识点/概念型资料，辅助消化教材笔记、章节总结、资格证备考</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[11.997px] relative shrink-0 w-[10px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 11.9965">
        <g clipPath="url(#clip0_10078_157)" id="Icon">
          <path d={svgPaths.p11345a00} fill="var(--fill-0, #FEE2E2)" id="Vector" />
          <path d={svgPaths.p28eb8b00} fill="var(--fill-0, #FCA5A5)" id="Vector_2" />
          <path d={svgPaths.p112d2a00} fill="var(--fill-0, #FCA5A5)" id="Vector_3" />
          <path d={svgPaths.p2ce6f600} fill="var(--fill-0, #FCA5A5)" id="Vector_4" />
        </g>
        <defs>
          <clipPath id="clip0_10078_157">
            <rect fill="white" height="11.9965" width="10" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text1() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[12px] not-italic relative shrink-0 text-[#9ca3af] text-[8px] whitespace-nowrap">Textbook_Ch3-9.pdf</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[5px] items-center relative size-full">
        <Icon />
        <Text1 />
      </div>
    </div>
  );
}

function Container15() {
  return <div className="bg-[#eeeff1] h-[3px] relative rounded-[2px] shrink-0 w-[93px]" data-name="Container" />;
}

function ContainerMargin() {
  return (
    <div className="relative shrink-0" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[5px] relative size-full">
        <Container15 />
      </div>
    </div>
  );
}

function Container16() {
  return <div className="bg-[#eeeff1] h-[3px] relative rounded-[2px] shrink-0 w-[70px]" data-name="Container" />;
}

function ContainerMargin1() {
  return (
    <div className="relative shrink-0" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[3px] relative size-full">
        <Container16 />
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute flex h-[52.883px] items-center justify-center left-[12.33px] top-[19.15px] w-[117.324px]">
      <div className="-rotate-5 flex-none">
        <div className="bg-[#f9fafb] content-stretch flex flex-col items-start px-[10.556px] py-[8.556px] relative rounded-[10px] w-[114px]" data-name="Container">
          <div aria-hidden className="absolute border-[#e5e7eb] border-[0.556px] border-solid inset-0 pointer-events-none rounded-[10px]" />
          <Container14 />
          <ContainerMargin />
          <ContainerMargin1 />
        </div>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="h-[11.997px] relative shrink-0 w-[10px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 11.9965">
        <g clipPath="url(#clip0_10078_151)" id="Icon">
          <path d={svgPaths.p11345a00} fill="var(--fill-0, #DBEAFE)" id="Vector" />
          <path d={svgPaths.p28eb8b00} fill="var(--fill-0, #93C5FD)" id="Vector_2" />
          <path d={svgPaths.p1cb26980} fill="var(--fill-0, #93C5FD)" id="Vector_3" />
          <path d={svgPaths.pc34cbf0} fill="var(--fill-0, #93C5FD)" id="Vector_4" />
        </g>
        <defs>
          <clipPath id="clip0_10078_151">
            <rect fill="white" height="11.9965" width="10" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text2() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12px] not-italic relative shrink-0 text-[#374151] text-[8px] whitespace-nowrap">Anatomy_Notes.pdf</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="relative shrink-0 w-[101px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[5px] items-center relative size-full">
        <Icon1 />
        <Text2 />
      </div>
    </div>
  );
}

function Container19() {
  return <div className="bg-[#f3f4f6] h-[3px] relative rounded-[2px] shrink-0 w-[101px]" data-name="Container" />;
}

function ContainerMargin2() {
  return (
    <div className="relative shrink-0" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[5px] relative size-full">
        <Container19 />
      </div>
    </div>
  );
}

function Container20() {
  return <div className="bg-[#f3f4f6] h-[3px] relative rounded-[2px] shrink-0 w-[91px]" data-name="Container" />;
}

function ContainerMargin3() {
  return (
    <div className="relative shrink-0" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[3px] relative size-full">
        <Container20 />
      </div>
    </div>
  );
}

function Container21() {
  return <div className="bg-[#f3f4f6] h-[3px] relative rounded-[2px] shrink-0 w-[66px]" data-name="Container" />;
}

function ContainerMargin4() {
  return (
    <div className="relative shrink-0" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[3px] relative size-full">
        <Container21 />
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute flex h-[51.233px] items-center justify-center left-[17.57px] top-[4.98px] w-[122.839px]">
      <div className="-rotate-1 flex-none">
        <div className="bg-white content-stretch drop-shadow-[0px_2px_4px_rgba(0,0,0,0.07)] flex flex-col items-start px-[10.556px] py-[8.556px] relative rounded-[10px] w-[122px]" data-name="Container">
          <div aria-hidden className="absolute border-[#d1d5db] border-[0.556px] border-solid inset-0 pointer-events-none rounded-[10px]" />
          <Container18 />
          <ContainerMargin2 />
          <ContainerMargin3 />
          <ContainerMargin4 />
        </div>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute bg-[#fef2f2] content-stretch flex flex-col items-start left-[82.35px] px-[9.556px] py-[3.556px] rounded-[20px] top-0" data-name="Container">
      <div aria-hidden className="absolute border-[#fca5a5] border-[0.556px] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[13.5px] not-italic relative shrink-0 text-[#ef4444] text-[9px] whitespace-nowrap">⚠️ Exam: 7 days</p>
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute bg-[#fff7ed] content-stretch flex flex-col items-start left-0 px-[9.556px] py-[3.556px] rounded-[20px] top-[111.4px]" data-name="Container">
      <div aria-hidden className="absolute border-[#fed7aa] border-[0.556px] border-solid inset-0 pointer-events-none rounded-[20px]" />
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[13.5px] not-italic relative shrink-0 text-[#c2410c] text-[9px] whitespace-nowrap">1,000+ pages</p>
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[147.995px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container13 />
        <Container17 />
        <Container22 />
        <Container23 />
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[26px] relative shrink-0 w-[171.997px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center pt-[10px] relative size-full">
        <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[15.75px] not-italic relative shrink-0 text-[#c4c4c4] text-[10.5px] text-center whitespace-nowrap">Where do I even start?</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[30px] top-[22.17px] w-[171.997px]" data-name="Container">
      <Container12 />
      <Paragraph />
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[11.997px] relative shrink-0 w-[30px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 11.9965">
        <g id="Icon">
          <path d="M2.00379 5.99825H21.998" id="Vector" stroke="var(--stroke-0, #E5E7EB)" strokeDasharray="3 2.5" strokeWidth="1.49956" />
          <path d={svgPaths.p3ce46800} id="Vector_2" stroke="var(--stroke-0, #D1D5DB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49956" />
        </g>
      </svg>
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[202px] pb-[20px] top-[93.17px]" data-name="Container">
      <Icon2 />
    </div>
  );
}

function Container28() {
  return (
    <div className="relative shrink-0 w-[176.675px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] [word-break:break-word] decoration-from-font decoration-solid font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[32px] line-through not-italic relative shrink-0 text-[#d1d5db] text-[32px] text-center tracking-[-1.5px] whitespace-nowrap">6 hours</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="h-[18px] relative shrink-0 w-[176.675px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center pt-[3px] relative size-full">
        <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[15px] not-italic relative shrink-0 text-[#e5e7eb] text-[10px] text-center whitespace-nowrap">of preparation</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div aria-hidden className="absolute border-[#f3f4f6] border-b-[0.556px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[14.556px] pt-[16px] px-[24px] relative size-full">
        <Container28 />
        <Container29 />
      </div>
    </div>
  );
}

function Container31() {
  return <div className="bg-[#eeeff1] flex-[62.352_0_0] h-[0.998px] min-w-px relative" data-name="Container" />;
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[7.995px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.99479 7.99479">
        <g id="Icon">
          <path d={svgPaths.p1b67de00} fill="var(--fill-0, #FDEA3B)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container32() {
  return (
    <div className="bg-[#111827] relative rounded-[20px] shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[4px] items-center px-[11px] py-[3px] relative size-full">
        <Icon3 />
        <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[13.5px] not-italic relative shrink-0 text-[9px] text-white tracking-[0.36px] whitespace-nowrap">AI</p>
      </div>
    </div>
  );
}

function Container33() {
  return <div className="bg-[#eeeff1] flex-[62.361_0_0] h-[0.998px] min-w-px relative" data-name="Container" />;
}

function Container30() {
  return (
    <div className="bg-[#fafafa] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[20px] py-[8px] relative size-full">
          <Container31 />
          <Container32 />
          <Container33 />
        </div>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="relative shrink-0 w-[176.675px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
        <p className="[word-break:break-word] font-['Inter:Black',sans-serif] font-black leading-[50px] not-italic relative shrink-0 text-[#111827] text-[50px] text-center tracking-[-3px] whitespace-nowrap">8 min</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="h-[19px] relative shrink-0 w-[176.675px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center pt-[4px] relative size-full">
        <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] not-italic relative shrink-0 text-[#92680a] text-[10px] text-center whitespace-nowrap">ready to study</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="bg-[#fdea3b] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[14px] pt-[16px] px-[24px] relative size-full">
        <Container35 />
        <Container36 />
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="bg-white h-[218.333px] relative rounded-[22px] shrink-0 w-[227.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip p-[1.667px] relative rounded-[inherit] size-full">
        <Container27 />
        <Container30 />
        <Container34 />
      </div>
      <div aria-hidden className="absolute border-[#fdea3b] border-[1.667px] border-solid inset-0 pointer-events-none rounded-[22px] shadow-[0px_0px_0px_6px_rgba(253,234,59,0.09),0px_8px_32px_0px_rgba(253,234,59,0.2)]" />
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-[232px] top-0 w-[255.998px]" data-name="Container">
      <Container26 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="h-[11.997px] relative shrink-0 w-[30px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 11.9965">
        <g id="Icon">
          <path d="M2.00379 5.99825H21.998" id="Vector" stroke="var(--stroke-0, #FDEA3B)" strokeWidth="2.49927" />
          <path d={svgPaths.p3ce46800} id="Vector_2" stroke="var(--stroke-0, #C9A800)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99942" />
        </g>
      </svg>
    </div>
  );
}

function Container37() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[488px] pb-[20px] top-[93.17px]" data-name="Container">
      <Icon4 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[12.995px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.9948 12.9948">
        <g id="Icon">
          <path d={svgPaths.p22b09100} fill="var(--fill-0, #1C1C1C)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container42() {
  return (
    <div className="relative rounded-[8px] shrink-0 size-[27.995px]" style={{ backgroundImage: "linear-gradient(135deg, rgb(253, 234, 59) 0%, rgb(245, 158, 11) 100%)" }} data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon5 />
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[16.5px] not-italic relative shrink-0 text-[#111827] text-[11px] whitespace-nowrap">Anatomy Final</p>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="h-[15px] relative shrink-0 w-[76.823px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-px relative size-full">
        <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[13.5px] not-italic relative shrink-0 text-[#22c55e] text-[9px] whitespace-nowrap">● Ready to study</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="relative shrink-0 w-[76.823px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container44 />
        <Container45 />
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="relative shrink-0 w-[136.667px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Container42 />
        <Container43 />
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div aria-hidden className="absolute border-[#fef9c3] border-b-[0.556px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[12.556px] pt-[14px] px-[16px] relative size-full">
        <Container41 />
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="relative shrink-0 w-[136.667px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[12.75px] not-italic relative shrink-0 text-[#92680a] text-[8.5px] tracking-[0.51px] uppercase whitespace-nowrap">{`Today's Goal`}</p>
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="[word-break:break-word] h-[22.995px] not-italic relative shrink-0 w-[136.667px] whitespace-nowrap" data-name="Container">
      <p className="absolute font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[22px] left-0 text-[#111827] text-[22px] top-0">5</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[17.45px] text-[#6b7280] text-[10px] top-[7.22px]">concepts</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-[66.11px] text-[#d1d5db] text-[12px] top-[5px]">·</p>
      <p className="absolute font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[22px] left-[74.67px] text-[#111827] text-[22px] top-0">8</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[92.53px] text-[#6b7280] text-[10px] top-[7.22px]">min</p>
    </div>
  );
}

function ContainerMargin5() {
  return (
    <div className="relative shrink-0" data-name="Container (margin)">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[5px] relative size-full">
        <Container48 />
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="bg-[#fffde7] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[12px] pt-[10px] px-[16px] relative size-full">
        <Container47 />
        <ContainerMargin5 />
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="bg-white h-[123.602px] relative rounded-[16px] shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip p-[1.667px] relative rounded-[inherit] size-full">
        <Container40 />
        <Container46 />
      </div>
      <div aria-hidden className="absolute border-[#fdea3b] border-[1.667px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_4px_20px_0px_rgba(253,234,59,0.18)]" />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[26px] relative shrink-0 w-[171.997px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center pt-[10px] relative size-full">
        <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[15.75px] not-italic relative shrink-0 text-[#c4c4c4] text-[10.5px] text-center whitespace-nowrap">Start immediately.</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[518px] top-[34.37px] w-[171.997px]" data-name="Container">
      <Container39 />
      <Paragraph1 />
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute h-[254.333px] left-[162px] max-w-[720.0000610351562px] top-[118.44px] w-[720px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container11 />
        <Container24 />
        <Container25 />
        <Container37 />
        <Container38 />
        <p className="[word-break:break-word] absolute font-['Inter:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal leading-[normal] left-[65px] not-italic text-[15px] text-black top-[229px] whitespace-nowrap">整理混乱的笔记</p>
        <p className="[word-break:break-word] absolute font-['Inter:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal leading-[normal] left-[325px] not-italic text-[15px] text-black top-[233px] whitespace-nowrap">整理混乱的笔记</p>
        <p className="[word-break:break-word] absolute font-['Inter:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal leading-[normal] left-[564px] not-italic text-[15px] text-black top-[233px] whitespace-nowrap">整理混乱的笔记</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute bg-[#fafaf8] content-stretch flex h-[579.444px] items-center justify-center left-0 overflow-clip top-[60.56px] w-[991.111px]" data-name="Container">
      <Container7 />
      <Container10 />
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[#fafaf8] relative size-full" data-name="Container">
      <Container1 />
      <Container6 />
      <p className="[word-break:break-word] absolute font-['Inter:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal h-[46px] leading-[normal] left-[223px] not-italic opacity-60 text-[15px] text-black top-[471px] w-[315px]">语言类资料暂不适用；英语学习模式即将上线。</p>
    </div>
  );
}