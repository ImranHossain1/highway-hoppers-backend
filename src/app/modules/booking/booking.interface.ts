export type IBusFilterRequest = {
  searchTerm?: string | undefined;
};

export type IBookingCreateData = {
  busScheduleId: string;
  sits: IBus_sits[];
};

export type IBus_sits = {
  bus_SitId: string;
};
