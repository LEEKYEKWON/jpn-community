const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function safeSeed() {
  console.log('🌱 안전한 시드 데이터 생성을 시작합니다...')
  console.log('⚠️  기존 데이터는 유지하고 추가 데이터만 생성합니다.')

  // 기존 관리자 계정 확인
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'abc@naver.com' }
  })

  if (existingAdmin) {
    console.log('✅ 기존 관리자 계정 확인됨:', existingAdmin.email)
    // 관리자 권한 확실히 설정
    await prisma.user.update({
      where: { email: 'abc@naver.com' },
      data: { 
        isAdmin: true,
        isApproved: true 
      }
    })
  } else {
    console.log('❌ abc@naver.com 계정을 찾을 수 없습니다.')
    console.log('해당 이메일로 먼저 회원가입을 진행해주세요.')
    return
  }

  const hashedPassword = await bcrypt.hash('123456', 12)

  // 테스트 사용자들 (기존 사용자와 겹치지 않는 이메일 사용)
  const testUsers = [
    {
      email: 'test-yuki@jpn.com',
      name: '테스트유키',
      bio: '서울에 거주한 지 3년 되었습니다. 한국 생활이 즐겁고 새로운 친구들을 만나고 싶어요!',
      birthDate: '1992-03-15',
      origin: '大阪',
      lat: 37.5519,
      lng: 126.9918,
      address: '서울특별시 강남구'
    },
    {
      email: 'test-sakura@jpn.com', 
      name: '테스트さくら',
      bio: '요리하는 것을 좋아해요. 한국 음식과 일본 음식 모두 만들 수 있어요!',
      birthDate: '1988-07-22',
      origin: '京都',
      lat: 37.4979,
      lng: 127.0276,
      address: '서울특별시 서초구'
    }
  ]

  console.log('👥 테스트 사용자 생성 중...')
  const users = []
  
  for (const userData of testUsers) {
    // 이미 존재하는 사용자인지 확인
    const existing = await prisma.user.findUnique({
      where: { email: userData.email }
    })
    
    if (!existing) {
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
      console.log(`✅ ${userData.email} 생성됨`)
    } else {
      console.log(`⏭️  ${userData.email} 이미 존재함`)
      users.push(existing)
    }
  }

  console.log('📝 테스트 게시글 생성 중...')
  
  // 간단한 테스트 게시글 몇 개만 추가
  const samplePosts = [
    {
      title: '[테스트] 홍대에서 일본인 모임',
      content: '테스트용 게시글입니다.',
      category: 'meet'
    },
    {
      title: '[테스트] 한국 병원 이용 팁',
      content: '테스트용 정보 게시글입니다.',
      category: 'korea-info'
    }
  ]

  for (const postData of samplePosts) {
    // 이미 같은 제목의 게시글이 있는지 확인
    const existing = await prisma.post.findFirst({
      where: { title: postData.title }
    })
    
    if (!existing && users.length > 0) {
      await prisma.post.create({
        data: {
          title: postData.title,
          content: postData.content,
          category: postData.category,
          authorId: users[0].id,
          viewCount: 0,
          likeCount: 0,
        },
      })
      console.log(`✅ "${postData.title}" 게시글 생성됨`)
    }
  }

  console.log('🎉 안전한 시드 데이터 생성이 완료되었습니다!')
  console.log('\n📋 확인된 관리자 계정:')
  console.log('👑 관리자: abc@naver.com')
}

safeSeed()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 중 오류:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
