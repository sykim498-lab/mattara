export function BackButton({ onClick }) {
  return (
    <button className="back-button" type="button" onClick={onClick} aria-label="이전 화면으로 돌아가기">
      <span aria-hidden="true">←</span> 뒤로가기
    </button>
  );
}
