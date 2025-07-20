import { useTranslation } from 'react-i18next';

export default function DishCard({ dish }) {
  const { t } = useTranslation();
  const dishNameRaw = t(`menu.${dish.id}.name`);
  const dishDescriptionRaw = t(`menu.${dish.id}.desc`);
  const dishName = !dishNameRaw || dishNameRaw.startsWith('menu.') ? dish.name : dishNameRaw;
  const dishDescription = !dishDescriptionRaw || dishDescriptionRaw.startsWith('menu.') ? dish.description : dishDescriptionRaw;

  // ... existing code ...
  return (
    <div>
      <h2>{dishName}</h2>
      <p>{dishDescription}</p>
      {/* ...phần còn lại của card... */}
    </div>
  );
}
