import type { ReactNode } from "react";
import type { SchemeName } from "@/lib/cases";

/** Схеми інтерфейсу, намальовані кодом. Тимчасова заміна реальним макетам у кейсі. */
export const SCHEMES: Record<SchemeName, ReactNode> = {
  catalog: (
    <div className="ui" data-r aria-hidden="true">
      <div className="ui__bar"><b>PumpLab</b><span>Каталог</span><span>Бренди</span><span>Кошик</span></div>
      <div className="ui-cat">
        <div className="ui-cat__f">
          <b>Категорія</b>
          <span className="ui-chk on"><i />Обрана категорія</span>
          <span className="ui-chk"><i /><span className="sk" style={{ width: "9rem" }} /></span>
          <span className="ui-chk"><i /><span className="sk" style={{ width: "12rem" }} /></span>
          <b>Смак</b>
          <span className="ui-chk on"><i />Обраний варіант</span>
          <span className="ui-chk"><i /><span className="sk" style={{ width: "7rem" }} /></span>
          <b>Фасування</b>
          <span className="ui-chk"><i /><span className="sk" style={{ width: "6rem" }} /></span>
        </div>
        <div className="ui-cat__g">
          {[70, 55, 64, 50, 72, 58, 62, 48].map((w, i) => (
            <div className="ui-p" key={i}>
              <div className="ui-p__v" />
              <span className="sk sk--w" style={{ width: `${w}%` }} />
              <span className="sk" style={{ width: `${w - 25}%` }} />
              <div className="ui-p__chips"><i /><i />{i % 2 === 0 && <i />}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  checkout: (
    <div className="ui" data-r aria-hidden="true">
      <div className="ui__bar"><b>PumpLab</b><span>Оформлення замовлення</span></div>
      <div className="ui-co">
        <div>
          <div className="ui-co__steps"><span className="on">01 Контакти</span><span>02 Доставка</span><span>03 Оплата</span></div>
          <div className="ui-co__form">
            <div className="ui-in">Ім’я</div>
            <div className="ui-in">Телефон</div>
            <div className="ui-in w">Email</div>
            <div className="ui-in w">Місто та відділення</div>
          </div>
        </div>
        <div className="ui-co__sum">
          <b>Ваше замовлення</b>
          <div className="ui-co__row"><span className="sk sk--w" style={{ width: "60%" }} /><span className="sk" style={{ width: "20%" }} /></div>
          <div className="ui-co__row"><span className="sk sk--w" style={{ width: "48%" }} /><span className="sk" style={{ width: "20%" }} /></div>
          <span className="hr hr--2" />
          <div className="ui-co__row"><span>Разом</span><span className="sk sk--w" style={{ width: "28%" }} /></div>
          <div className="ui-btn">Підтвердити</div>
        </div>
      </div>
    </div>
  ),
  admin: (
    <div className="ui" data-r aria-hidden="true">
      <div className="ui__bar"><b>Admin</b><span>Пошук</span></div>
      <div className="ui-ad">
        <div className="ui-ad__nav"><span className="on">Замовлення</span><span>Товари</span><span>Ціни</span><span>Контент</span><span>Клієнти</span></div>
        <div className="ui-ad__t">
          <span className="hd2">Замовлення</span><span className="hd2">Сума</span><span className="hd2">Дата</span><span className="hd2">Статус</span>
          {[["60", "60", "Новий"], ["48", "50", "В роботі"], ["66", "44", "В роботі"], ["52", "60", "Доставлено"], ["58", "48", "Доставлено"]].map(([a, b, st], i) => (
            <div className="ui-ad__r" key={i}>
              <span><i className="sk sk--w" style={{ width: `${a}%` }} /></span>
              <span><i className="sk" style={{ width: `${b}%` }} /></span>
              <span><i className="sk" style={{ width: "70%" }} /></span>
              <span><i className={`ui-pill ${i === 0 ? "on" : ""}`}>{st}</i></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};
