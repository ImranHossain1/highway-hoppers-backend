export type IBookingCreateData = {
  busScheduleId: string;
  sits: IBus_sits[];
};

export type IBus_sits = {
  bus_SitId: string;
};
export type IBookingInterfaceRequest = {
  searchTerm?: string;
};
