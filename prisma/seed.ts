import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 시드 데이터 생성을 시작합니다...')

  // 기존 데이터 정리 (선택사항)
  console.log('🧹 기존 데이터 정리 중...')
  await prisma.comment.deleteMany()
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()

  // 테스트 사용자들 생성
  console.log('👥 테스트 사용자 생성 중...')
  
  const hashedPassword = await bcrypt.hash('123456', 12)

  // 관리자 계정
  const admin = await prisma.user.create({
    data: {
      email: 'admin@jpn.com',
      name: '관리자',
      password: hashedPassword,
      bio: '사이트 관리자입니다. 궁금한 점이 있으시면 언제든지 문의해주세요.',
      birthDate: '1990-01-01',
      origin: '東京',
      latitude: 37.5665,
      longitude: 126.9780,
      address: '서울특별시 중구',
      isAdmin: true,
      isApproved: true,
    },
  })

  // 일반 사용자들
  const users = []
  const testUsers = [
    {
      email: 'yuki@jpn.com',
      name: '유키',
      bio: '서울에 거주한 지 3년 되었습니다. 한국 생활이 즐겁고 새로운 친구들을 만나고 싶어요!',
      birthDate: '1992-03-15',
      origin: '大阪',
      lat: 37.5519,
      lng: 126.9918,
      address: '서울특별시 강남구'
    },
    {
      email: 'sakura@jpn.com', 
      name: 'さくら',
      bio: '요리하는 것을 좋아해요. 한국 음식과 일본 음식 모두 만들 수 있어요!',
      birthDate: '1988-07-22',
      origin: '京都',
      lat: 37.4979,
      lng: 127.0276,
      address: '서울특별시 서초구'
    },
    {
      email: 'mai@jpn.com',
      name: 'まい',
      bio: '부산에 살고 있어요. 바다가 보이는 곳이라 고향 생각이 많이 나요.',
      birthDate: '1995-12-03',
      origin: '福岡',
      lat: 35.1796,
      lng: 129.0756,
      address: '부산광역시 해운대구'
    },
    {
      email: 'hiroko@jpn.com',
      name: 'ひろこ',
      bio: '대구에서 한국어를 공부하고 있어요. 언어 교환할 친구를 찾고 있습니다!',
      birthDate: '1990-09-18',
      origin: '名古屋',
      lat: 35.8714,
      lng: 128.6014,
      address: '대구광역시 중구'
    },
    {
      email: 'ayame@jpn.com',
      name: 'あやめ',
      bio: '인천에 거주하며 두 아이를 키우고 있어요. 육아 정보 공유해요~',
      birthDate: '1987-05-30',
      origin: '横浜',
      lat: 37.4563,
      lng: 126.7052,
      address: '인천광역시 연수구'
    }
  ]

  for (const userData of testUsers) {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        bio: userData.bio,
        birthDate: userData.birthDate,
        origin: userData.origin,
        latitude: userData.lat,
        longitude: userData.lng,
        address: userData.address,
        isAdmin: false,
        isApproved: true,
      },
    })
    users.push(user)
  }

  console.log(`✅ ${users.length + 1}명의 사용자가 생성되었습니다.`)

  // 게시글 생성
  console.log('📝 테스트 게시글 생성 중...')
  
  const categories = ['meet', 'korea-info', 'market', 'board']
  const posts = []

  const samplePosts = {
    meet: [
      {
        title: '홍대에서 일본인 모임 어떠세요?',
        content: '안녕하세요! 홍대 근처에 거주하는 일본인 아내들끼리 정기적으로 만나서 차 마시며 이야기 나누는 모임을 만들고 싶어요. 관심 있으신 분들 댓글 남겨주세요~ 🌸'
      },
      {
        title: '강남 맘카페 추천해주세요',
        content: '강남에서 아이와 함께 갈 수 있는 좋은 카페 있을까요? 놀이시설도 있고 커피도 맛있는 곳으로 추천 부탁드려요!'
      },
      {
        title: '한국어 스터디 그룹 모집',
        content: '한국어 실력 향상을 위한 스터디 그룹을 만들려고 해요. 주 1회 정도 만나서 한국어로 대화하는 시간을 가져요. 초급~중급 수준이면 환영입니다!'
      }
    ],
    'korea-info': [
      {
        title: '한국 병원 이용 팁 공유합니다',
        content: '한국에서 병원 다니는 방법이 일본과 달라서 처음엔 당황스러웠어요. 경험을 바탕으로 유용한 팁들을 공유해드릴게요. 1. 예약은 필수 2. 의료보험 꼭 준비 3. 통역 서비스 활용...'
      },
      {
        title: '마트에서 일본 식재료 구하는 법',
        content: '일본 요리를 해먹고 싶을 때 식재료 구하기가 어려워요. 이마트, 롯데마트, 코스트코 등에서 구할 수 있는 일본 식재료들과 대체재들을 정리해봤어요!'
      },
      {
        title: '은행 계좌 개설 후기',
        content: '외국인으로서 한국 은행에서 계좌 개설하는 과정을 공유합니다. 필요한 서류와 절차, 유의사항들을 자세히 알려드릴게요.'
      }
    ],
    market: [
      {
        title: '[판매] 일본에서 가져온 화장품들',
        content: '일본에서 가져온 화장품들을 판매해요. 모두 새 제품이고 한국에서 구하기 어려운 브랜드들입니다. 개별 가격은 댓글로 문의해주세요!'
      },
      {
        title: '[나눔] 아기 옷 무료 나눔',
        content: '돌 지난 아기 옷들 무료로 나눔해요. 상태 좋은 것들만 골라뒀습니다. 선착순으로 진행할게요!'
      },
      {
        title: '[구매] 일본 도서 구합니다',
        content: '일본 소설책이나 잡지 있으시면 판매해주세요. 상태는 크게 상관없어요. 연락 주시면 직접 받으러 갈게요!'
      }
    ],
    board: [
      {
        title: '한국 겨울 나기 어려워요 ㅠㅠ',
        content: '일본보다 한국 겨울이 훨씬 춥네요... 특히 실내 난방이 부족해서 집에서도 추워요. 다들 어떻게 겨울을 나고 계시나요? 좋은 난방용품이나 팁 있으면 공유해주세요!'
      },
      {
        title: '김치 만들기 도전했다가...',
        content: '시어머니가 김치 만드는 법을 가르쳐주셨는데 생각보다 어렵네요 😅 다들 김치 담그기 성공하셨나요? 실패담이나 성공 비법 공유해요!'
      },
      {
        title: '일본 음식이 그리울 때',
        content: '가끔 고향 음식이 너무 그리워서 울컥할 때가 있어요. 다들 어떨 때 일본이 가장 그리우신가요? 그리고 어떻게 극복하고 계신지 궁금해요.'
      }
    ]
  }

  for (const category of categories) {
    const categoryPosts = samplePosts[category as keyof typeof samplePosts]
    
    for (const postData of categoryPosts) {
      const randomAuthor = users[Math.floor(Math.random() * users.length)]
      
      const post = await prisma.post.create({
        data: {
          title: postData.title,
          content: postData.content,
          category: category,
          authorId: randomAuthor.id,
          viewCount: Math.floor(Math.random() * 100),
          likeCount: Math.floor(Math.random() * 20),
        },
      })
      posts.push(post)
    }
  }

  console.log(`✅ ${posts.length}개의 게시글이 생성되었습니다.`)

  // 댓글 생성
  console.log('💬 테스트 댓글 생성 중...')
  
  const sampleComments = [
    '좋은 정보 감사해요!',
    '저도 같은 경험이 있어요.',
    '도움이 많이 되었습니다 🙏',
    '연락드릴게요!',
    '저도 참여하고 싶어요.',
    '정말 유용한 글이네요.',
    '감사합니다!',
    '저도 관심 있어요!',
    '좋은 아이디어네요.',
    '공감해요 ㅠㅠ'
  ]

  let commentCount = 0
  for (const post of posts) {
    const numComments = Math.floor(Math.random() * 4) + 1 // 1-4개 댓글
    
    for (let i = 0; i < numComments; i++) {
      const randomAuthor = [...users, admin][Math.floor(Math.random() * (users.length + 1))]
      const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)]
      
      await prisma.comment.create({
        data: {
          content: randomComment,
          postId: post.id,
          authorId: randomAuthor.id,
        },
      })
      commentCount++
    }
  }

  console.log(`✅ ${commentCount}개의 댓글이 생성되었습니다.`)

  console.log('🎉 시드 데이터 생성이 완료되었습니다!')
  console.log('\n📋 생성된 테스트 계정:')
  console.log('👑 관리자: admin@jpn.com (비밀번호: 123456)')
  console.log('👤 일반 사용자: yuki@jpn.com, sakura@jpn.com, mai@jpn.com, hiroko@jpn.com, ayame@jpn.com')
  console.log('🔑 모든 계정의 비밀번호: 123456')
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 중 오류:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
