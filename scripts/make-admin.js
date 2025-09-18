const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function makeAdmin() {
  const email = 'abc@naver.com'
  
  try {
    // 해당 이메일의 사용자를 찾아서 관리자로 설정
    const user = await prisma.user.update({
      where: { email: email },
      data: { 
        isAdmin: true,
        isApproved: true 
      }
    })
    
    console.log(`✅ ${email} 계정이 관리자로 설정되었습니다.`)
    console.log('사용자 정보:', {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin
    })
  } catch (error) {
    if (error.code === 'P2025') {
      console.log(`❌ ${email} 계정을 찾을 수 없습니다.`)
      console.log('먼저 해당 이메일로 회원가입을 진행해주세요.')
    } else {
      console.error('오류:', error)
    }
  }
}

makeAdmin()
  .finally(async () => {
    await prisma.$disconnect()
  })
