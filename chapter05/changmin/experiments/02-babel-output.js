"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
// 원본 async/await 코드
// 이 코드가 어떻게 변환되는지 확인해보자
function getUserId(_x) {
  return _getUserId.apply(this, arguments);
}
function _getUserId() {
  _getUserId = (0, _asyncToGenerator2.default)(function* (phoneNumber) {
    // DB 조회를 시뮬레이션
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`전화번호 ${phoneNumber}로 사용자 ID 조회 중...`);
        resolve(`user_${phoneNumber}`);
      }, 100);
    });
  });
  return _getUserId.apply(this, arguments);
}
function getAddress(_x2) {
  return _getAddress.apply(this, arguments);
}
function _getAddress() {
  _getAddress = (0, _asyncToGenerator2.default)(function* (userId) {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`사용자 ID ${userId}로 주소 조회 중...`);
        resolve(`서울시 강남구`);
      }, 100);
    });
  });
  return _getAddress.apply(this, arguments);
}
function checkDeliveryZone(_x3) {
  return _checkDeliveryZone.apply(this, arguments);
}
function _checkDeliveryZone() {
  _checkDeliveryZone = (0, _asyncToGenerator2.default)(function* (address) {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`주소 ${address}의 배달 가능 여부 확인 중...`);
        resolve({
          deliverable: true,
          fee: 3000
        });
      }, 100);
    });
  });
  return _checkDeliveryZone.apply(this, arguments);
}
function placeOrder(_x4, _x5) {
  return _placeOrder.apply(this, arguments);
} // 실제 async/await 사용
function _placeOrder() {
  _placeOrder = (0, _asyncToGenerator2.default)(function* (deliveryInfo, message) {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`주문 처리: ${message}`);
        resolve({
          orderId: "ORDER_12345",
          deliveryFee: deliveryInfo.fee,
          status: "완료"
        });
      }, 100);
    });
  });
  return _placeOrder.apply(this, arguments);
}
function orderFood(_x6) {
  return _orderFood.apply(this, arguments);
} // 실행
function _orderFood() {
  _orderFood = (0, _asyncToGenerator2.default)(function* (phoneNumber) {
    try {
      const userId = yield getUserId(phoneNumber);
      const address = yield getAddress(userId);
      const deliveryInfo = yield checkDeliveryZone(address);
      const result = yield placeOrder(deliveryInfo, "주문 처리 완료");
      return result;
    } catch (error) {
      console.error("주문 처리 중 오류 발생:", error);
      throw error;
    }
  });
  return _orderFood.apply(this, arguments);
}
orderFood("010-1234-5678").then(result => {
  console.log("최종 결과:", result);
});
