// 원본 async/await 코드
// 이 코드가 어떻게 변환되는지 확인해보자

async function getUserId(phoneNumber) {
  // DB 조회를 시뮬레이션
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`전화번호 ${phoneNumber}로 사용자 ID 조회 중...`);
      resolve(`user_${phoneNumber}`);
    }, 100);
  });
}

async function getAddress(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`사용자 ID ${userId}로 주소 조회 중...`);
      resolve(`서울시 강남구`);
    }, 100);
  });
}

async function checkDeliveryZone(address) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`주소 ${address}의 배달 가능 여부 확인 중...`);
      resolve({ deliverable: true, fee: 3000 });
    }, 100);
  });
}

async function placeOrder(deliveryInfo, message) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`주문 처리: ${message}`);
      resolve({
        orderId: "ORDER_12345",
        deliveryFee: deliveryInfo.fee,
        status: "완료",
      });
    }, 100);
  });
}

// 실제 async/await 사용
async function orderFood(phoneNumber) {
  try {
    const userId = await getUserId(phoneNumber);
    const address = await getAddress(userId);
    const deliveryInfo = await checkDeliveryZone(address);
    const result = await placeOrder(deliveryInfo, "주문 처리 완료");
    return result;
  } catch (error) {
    console.error("주문 처리 중 오류 발생:", error);
    throw error;
  }
}

// 실행
orderFood("010-1234-5678").then((result) => {
  console.log("최종 결과:", result);
});
