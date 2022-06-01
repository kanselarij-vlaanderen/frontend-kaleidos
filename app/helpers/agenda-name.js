import { helper } from '@ember/component/helper';

export default helper(async function agendaName([agenda]) {
  const isDesignAgenda = await (await agenda.status).isDesignAgenda;
  const agendaName = agenda.serialnumber || '';
  let prefix = 'Agenda';
  if (isDesignAgenda) {
    prefix = 'Ontwerpagenda';
  }
  return `${prefix} ${agendaName}`;
});
