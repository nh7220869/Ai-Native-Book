import React, { useState } from 'react';
import DeepSeekTranslatorModal from '../../../components/DeepSeekTranslatorModal'; // Adjust path as needed
import { useNavbarSecondaryMenu } from '@docusaurus/theme-common/internal';

function DeepSeekTranslatorNavbarItem() {
  const [showTranslatorModal, setShowTranslatorModal] = useState(false);
  const { hide: hideSecondaryMenu } = useNavbarSecondaryMenu();

  const handleOpenModal = () => {
    setShowTranslatorModal(true);
    hideSecondaryMenu(); // Hide mobile menu if open
  };

  const handleCloseModal = () => {
    setShowTranslatorModal(false);
  };

  return (
    <>
      <div
        className="navbar__item navbar__link" // Docusaurus navbar link styles
        onClick={handleOpenModal}
        style={{ cursor: 'pointer' }}
        title="Translate Book"
      >
        <span role="img" aria-label="translate">📚</span> Translate
      </div>
      {showTranslatorModal && <DeepSeekTranslatorModal onClose={handleCloseModal} />}
    </>
  );
}

export default DeepSeekTranslatorNavbarItem;