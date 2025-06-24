const showGoogleConsent = () => {
    // 显示 Google 隐私政策和使用条款弹窗
    const modal = document.getElementById('google-consent-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}
const acceptGoogleConsent = closeGoogleConsentModal = () => {
    // 关闭 Google 隐私政策和使用条款弹窗
    const modal = document.getElementById('google-consent-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}
