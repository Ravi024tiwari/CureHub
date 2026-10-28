import React, { useEffect, useState, useCallback } from 'react';
import {
  HelpCircle,
  Building2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { DoctorSidebar, DoctorHeader } from '@/components/doctor/dashboard';
import {
  DoctorHospitalKpis,
  DoctorHospitalFilters,
  DoctorHospitalCard,
  DoctorHospitalListItem,
  DoctorJoinHospitalModal,
  HowItWorksModal,
} from '@/components/doctor/hospitals';
import type {
  DoctorHospitalItem,
  DoctorHospitalKpis as KpiType,
  DoctorHospitalFilterState,
} from '@/types/doctorHospital';
import { doctorService } from '@/services/doctorService';

export const DoctorHospitalsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data states
  const [hospitals, setHospitals] = useState<DoctorHospitalItem[]>([]);
  const [kpis, setKpis] = useState<KpiType | null>(null);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [doctorDepartment, setDoctorDepartment] = useState<string>('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Filter & View states
  const [filters, setFilters] = useState<DoctorHospitalFilterState>({
    search: '',
    city: 'ALL',
    hospitalType: 'ALL',
    department: 'ALL',
    sortBy: 'nearest',
    page: 1,
    limit: 9,
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHospitalForJoin, setSelectedHospitalForJoin] = useState<DoctorHospitalItem | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('curehealth_doc_fav_hospitals');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Doctor Info for Header
  const doctorName =
    user?.name ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : 'Doctor';

  // Fetch Hospitals from API
  const fetchHospitals = useCallback(
    async (pageToFetch = currentPage) => {
      try {
        setLoading(true);
        setError(null);

        const res = await doctorService.getAvailableHospitals({
          page: pageToFetch,
          limit: filters.limit,
          search: filters.search.trim() || undefined,
          city: filters.city !== 'ALL' ? filters.city : undefined,
          hospitalType: filters.hospitalType !== 'ALL' ? filters.hospitalType : undefined,
          department: filters.department !== 'ALL' ? filters.department : undefined,
          sortBy: filters.sortBy || undefined,
        });

        if (res && res.hospitals) {
          setHospitals(res.hospitals || []);
          setKpis(res.kpis || null);
          setTotalPages(res.pagination?.totalPages || 1);
          setTotalCount(res.pagination?.totalDocs || 0);

          if (res.filterOptions) {
            setAvailableCities(res.filterOptions.cities || []);
            setAvailableDepartments(res.filterOptions.departments || []);
          }

          if (res.doctorProfile?.department) {
            setDoctorDepartment(res.doctorProfile.department);
          }
        } else {
          setError('Failed to load hospitals');
        }
      } catch (err: any) {
        console.error('Error fetching hospitals:', err);
        setError(
          err?.response?.data?.message || err?.message || 'Error loading hospitals list. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    },
    [currentPage, filters]
  );

  // Trigger search on filter change
  useEffect(() => {
    fetchHospitals(currentPage);
  }, [fetchHospitals, currentPage]);

  const handleChangeFilter = (key: keyof DoctorHospitalFilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      city: 'ALL',
      hospitalType: 'ALL',
      department: 'ALL',
      sortBy: 'nearest',
      page: 1,
      limit: 9,
    });
    setCurrentPage(1);
  };

  // Toggle favorite
  const handleToggleFavorite = (hospitalId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(hospitalId)) {
        next.delete(hospitalId);
      } else {
        next.add(hospitalId);
      }
      try {
        localStorage.setItem('curehealth_doc_fav_hospitals', JSON.stringify([...next]));
      } catch (e) {
        console.error('Could not save favorite', e);
      }
      return next;
    });
  };

  // Request to join click
  const handleOpenJoinModal = (hospital: DoctorHospitalItem) => {
    setSelectedHospitalForJoin(hospital);
    setIsJoinModalOpen(true);
  };

  // Successful join request sent callback
  const handleJoinSuccess = (hospitalId: string, department: string) => {
    // Optimistically update the hospital in local state
    setHospitals((prev) =>
      prev.map((h) =>
        h._id === hospitalId
          ? {
              ...h,
              hasRequested: true,
              requestStatus: 'PENDING',
              requestedDepartment: department,
            }
          : h
      )
    );
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] text-slate-900 flex selection:bg-blue-100 selection:text-blue-700 antialiased">
      {/* 1. Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-screen shrink-0">
        <DoctorSidebar />
      </div>

      {/* 2. Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-50 w-64 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <DoctorSidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Content Container */}
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden flex flex-col min-w-0">
        {/* Top Header */}
        <DoctorHeader
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          doctorName={doctorName}
          department={doctorDepartment || 'General Practice'}
          avatar={user?.avatar || null}
        />

        {/* Page Content */}
        <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6 pb-20">
          {/* Header Title & How it works link */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <span>Hospitals</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  {totalCount} Available
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Find and request affiliation with hospitals to join their medical team.
              </p>
            </div>

            <button
              onClick={() => setIsHowItWorksOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline self-start sm:self-center transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>How it works?</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => fetchHospitals(currentPage)}
                className="px-3 py-1 rounded-xl bg-white border border-rose-200 text-rose-700 font-bold hover:bg-rose-100 cursor-pointer text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* KPI Stat Cards */}
          {kpis && (
            <DoctorHospitalKpis
              kpis={kpis}
              filters={filters}
              onSelectType={(type) => {
                handleChangeFilter('hospitalType', type);
              }}
            />
          )}

          {/* Filter Bar with Search, Dropdowns, Grid/List view toggle */}
          <DoctorHospitalFilters
            filters={filters}
            availableCities={availableCities}
            availableTypes={['Multi-Speciality', 'Private', 'Government', 'General']}
            availableDepartments={availableDepartments}
            viewMode={viewMode}
            onChangeFilter={handleChangeFilter}
            onResetFilters={handleResetFilters}
            onChangeViewMode={setViewMode}
          />

          {/* Hospitals Results List / Grid */}
          {loading ? (
            <div className="min-h-[350px] flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-9 h-9 text-blue-600 animate-spin" />
              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                Loading registered medical facilities...
              </p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Hospitals Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No registered hospitals matched your search criteria or active filters. Try clearing some filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {hospitals.map((hospital, idx) => (
                <DoctorHospitalCard
                  key={hospital._id}
                  hospital={hospital}
                  index={idx}
                  isFavorite={favoriteIds.has(hospital._id)}
                  onToggleFavorite={handleToggleFavorite}
                  onRequestJoin={handleOpenJoinModal}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {hospitals.map((hospital, idx) => (
                <DoctorHospitalListItem
                  key={hospital._id}
                  hospital={hospital}
                  index={idx}
                  isFavorite={favoriteIds.has(hospital._id)}
                  onToggleFavorite={handleToggleFavorite}
                  onRequestJoin={handleOpenJoinModal}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-center gap-2 pt-6 pb-4">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <DoctorJoinHospitalModal
        isOpen={isJoinModalOpen}
        hospital={selectedHospitalForJoin}
        onClose={() => {
          setIsJoinModalOpen(false);
          setSelectedHospitalForJoin(null);
        }}
        onSuccess={handleJoinSuccess}
        defaultDepartment={doctorDepartment}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </div>
  );
};
