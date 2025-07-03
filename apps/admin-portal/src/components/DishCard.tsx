          <button
            className="mt-2 w-full rounded-lg bg-[#C92A15] px-6 py-3 text-lg font-bold text-white hover:bg-[#a81f10]"
            onClick={async () => {
              try {
                if (isPizzaCategory && !isSpaghettiCategory && !isChickenCategory) {
                  await addToCart(dish.id, {
                    quantity: 1,
                    size: selectedSize,
                    base: selectedVariant,
                    note,
                  });
                } else {
                  await addToCart(dish.id, {
                    quantity: 1,
                    note,
                  });
                }
                alert('Thêm vào giỏ hàng thành công!');
                onClose();
              } catch (err) {
                alert('Thêm vào giỏ hàng thất bại!');
                console.error('Lỗi thêm vào giỏ hàng:', err);
              }
            }}
          >
            THÊM VÀO GIỎ HÀNG
          </button> 