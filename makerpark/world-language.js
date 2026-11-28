((park) => {
'use strict';

const names={
  coral:'Coral',sage:'Sage',plum:'Plum',momo:'Momo',sol:'Sol',
  vibe:'Onuri Creative Street',manual:'Maker Workshop',class:'Activity Playground',doc:'Story Station',manage:'Welcome Plaza',
  quiz:'Brain Spark Lab','kids-mbti':'Personality Discovery','procedure':'Step-by-Step Puzzle Shop',
  keyring:'UV Resin Keyrings',holder:'3D Cable Holders',resin:'Resin Art',figures:'Figure Collection',
  printer:'3D Printer',laser:'Laser Cutter',vector:'Vector Workbench',idea:'Idea Cards',ladder:'Ladder Game',
  reading:'Maker Reading Corner',book:'Lesson Examples',welcome:'Park Guide',shelf:'Resource Shelf'
};
const copy={
  keyring:'Look at the colors and tiny details suspended inside these clear UV resin keyrings.',
  holder:'A cable holder keeps cords from slipping off a desk. Compare the slot shapes and sizes.',
  resin:'Look at how light passes through the petals of these resin flower pieces.',
  figures:'Compare the robot, rabbit, and space explorer. How do color and silhouette change each character?',
  printer:'A 3D printer builds objects layer by layer. Inspect the rotating model to see how it fits together.',
  laser:'A laser cutter uses a focused beam to shape materials. Staff check the material and settings before cutting.',
  vector:'Vector designs use editable paths. Look for gaps or overlapping lines before making an object.',
  idea:'Pick an object that keeps falling off a desk. Think of something you could make to hold it in place.',
  ladder:'The ladder game picks one result from several possibilities. Try it with friends.',
  reading:'Before making a keyring, check the size of the small parts and where the ring will go.',
  book:'Find resin art examples and making reports for classroom activities.',
  welcome:'Visit the five park areas for stamps and a Maker License. Spend your activity credits at the food stalls.',
  shelf:'Download digital business card examples here, or open the area resources for notices and files.'
};
const labels={
  '오누리 메이커파크':'Onuri Maker Park','공원 메뉴':'Park Menu','이름표':'Labels','지도 이름표 표시':'Show map labels',
  '현재 계절':'Current season','봄':'Spring','여름':'Summer','가을':'Autumn','겨울':'Winter',
  '현재 시간':'Current time','아침':'Morning','낮':'Day','저녁':'Evening','밤':'Night',
  '계절':'Season','시간':'Time','걷기 모드':'Walk Mode','전체 보기':'Overview','전체 화면':'Fullscreen','전체 화면 닫기':'Exit fullscreen',
  '드래그로 회전 · 휠로 확대·축소':'Drag to rotate · Scroll to zoom','아바타가 걸어 다니는 3D 메이커파크':'Interactive 3D Maker Park',
  '지도 보기 및 이동':'Map view and movement','지도 표시 설정':'Map settings','계절과 시간대':'Season and time',
  '아바타 이동':'Move avatar','앞으로':'Forward','뒤로':'Back','왼쪽':'Left','오른쪽':'Right',
  '공원 입구':'Park Entrance','공원 입구·산책로':'Park Entrance & Paths','조작 방법':'Controls',
  '드래그해 시점을 돌리고 휠로 확대하거나 축소하세요. 걷기 모드에서는 바닥을 눌러 이동할 수 있어요. 방향키·WASD로도 걸을 수 있습니다.':'Drag to rotate and scroll to zoom. In Walk Mode, click the ground to move. You can also use the arrow keys or WASD.',
  '수채화 안내 지도':'Illustrated Map','전체 어트랙션':'All Attractions','닫기':'Close','취소':'Cancel','이동':'Open',
  '어서오세요, 뭘 도와드릴까요?':'Welcome! How can I help?','계속 둘러보기':'Keep exploring','해당 메뉴로 이동하시겠습니까?':'Open this activity?',
  '직원에게 말 걸기':'Talk to staff','글·작품·수업 자료 열기':'Open area resources','수업 자료 보기':'View resources',
  '메이커 전시 거리':'Maker Gallery','메이커 작업실':'Workshop','아이디어 부스':'Idea Booth','배움 도서관':'Learning Library','공원 안내센터':'Visitor Center',
  '컴퓨터 퀴즈 풀기':'Take the Computer Quiz','어린이 MBTI':'Kids’ MBTI','절차적 사고 게임':'Sequencing Game','Class. 수업 부스':'Class Activity Booths',
  '아바타 고르기':'Choose an Avatar','정원사':'Gardener','지도 탐험가':'Map Explorer','만들기 공방지기':'Workshop Host','풍선 디자이너':'Balloon Designer','공원 정비사':'Park Technician',
  '아바타마다 체험, 크레딧, 면허증과 메달이 따로 기록됩니다.':'Each avatar has its own activities, credits, license, and medals.',
  '완료':'Done','내 메이커 여권':'My Maker Passport','메이커 면허증을 받았어요!':'You earned a Maker License!',
  '오누리 메이커 면허증':'Onuri Maker License','글·작품 스탬프 보기':'View activity stamps',
  '구역 안의 도구와 작품 안내를 모두 들으면 구역 스탬프를 받습니다.':'Explore every station in an area to earn its stamp.',
  '체험 완료 · 계속 둘러보기':'Activity complete · Keep exploring','체험 완료 · 1크레딧 받기':'Complete activity · Earn 1 credit',
  '왼쪽으로 회전':'Rotate left','오른쪽으로 회전':'Rotate right','회전하는 3D 출력 모형':'Rotating 3D print model',
  '복숭아빛 풍선 받기':'Pick a peach balloon','민트빛 풍선 받기':'Pick a mint balloon','금빛 풍선 받기':'Pick a gold balloon','풍선 돌려주기':'Return balloon',
  '풍선을 돌려줬어요.':'Balloon returned.','풍선을 들고 공원을 산책해 보세요!':'Take your balloon for a walk!',
  '이미 화면을 가득 채운 상태입니다.':'The park is already fullscreen.',
  '3D 화면을 표시할 수 없습니다. 오른쪽 구역 버튼으로 체험하세요.':'The 3D view is unavailable. Open the Park Menu to visit an area.'
};

park.worldLanguage={names,copy,labels};
})(window.onuriMakerPark ??= {});
